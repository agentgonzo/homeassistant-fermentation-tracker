import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, FermentationCardConfig } from "./types";
import {
  findGravityEntity,
  findTemperatureEntity,
  findEntityByDeviceClass,
} from "./utils/entity-discovery";
import { sgToPlato, sgToBrix, calcAttenuation, calcAbv } from "./utils/fermentation-math";

declare global {
  interface HTMLElementTagNameMap {
    "fermentation-tracker-card": FermentationTrackerCard;
  }
}

@customElement("fermentation-tracker-card")
export class FermentationTrackerCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public preview = false;

  @state() private _config?: FermentationCardConfig;
  @state() private _gravityEntityId?: string;
  @state() private _tempEntityIds: string[] = [];
  @state() private _signalEntityId?: string;
  @state() private _batteryEntityId?: string;
  @state() private _historyCard?: HTMLElement & { hass?: HomeAssistant };
  @state() private _deviceInfoCard?: HTMLElement & { hass?: HomeAssistant };
  private _historyCardKey?: string;
  private _deviceInfoCardKey?: string;

  // Cached state value from ~24h ago, keyed by entity_id (used for delta arrows)
  @state() private _historicalValues: Record<string, number> = {};
  // Gravity at the start of the graph window (~72h ago) — used as OG
  @state() private _originalGravity?: number;
  private _historicalKey?: string;
  private _historicalRefreshTimer?: ReturnType<typeof setInterval>;

  // Resolved hours for the current view (graph + OG). Recomputed when config changes.
  @state() private _resolvedRangeHours = 72;
  private _rangeKey?: string;

  // Hard ceiling for auto-detection lookback (also the fallback if no gap is found)
  private static readonly AUTO_DETECT_LOOKBACK_HOURS = 30 * 24;
  // A gap of this length without readings is considered the start of a new fermentation
  private static readonly AUTO_DETECT_GAP_HOURS = 6;
  // Fallback range when auto detection finds no gap
  private static readonly AUTO_FALLBACK_HOURS = 7 * 24;
  // After the gap, the first ~hour of iSpindel readings are unstable while the
  // hydrometer settles into the wort. We skip them by finding the first window
  // of consecutive readings where the SG is stable to within this tolerance.
  private static readonly STABILITY_TOLERANCE_SG = 0.005;
  private static readonly STABILITY_WINDOW_SIZE = 3;
  // Cap on how far past the raw start we'll look for stability before giving up
  private static readonly STABILITY_MAX_OFFSET_HOURS = 4;
  // Plausible SG range for wort/beer/wine. Readings outside this band are
  // treated as garbage (iSpindel sitting upright, stuck on the side, etc.) and
  // are excluded from gap and stability detection.
  private static readonly MIN_PLAUSIBLE_SG = 0.99;
  private static readonly MAX_PLAUSIBLE_SG = 1.2;
  // A reading needs at least one *supporting* neighbour within ±SUPPORT_WINDOW_HOURS
  // whose SG is within ±SUPPORT_TOLERANCE_SG. Without one it's treated as an
  // isolated noise reading and excluded from gap detection. This filters out
  // brief in-range readings while the iSpindel is being moved/handled.
  private static readonly SUPPORT_WINDOW_HOURS = 4;
  private static readonly SUPPORT_TOLERANCE_SG = 0.02;

  static styles = css`
    ha-card {
      height: 100%;
    }
    .card-header {
      padding: 16px 16px 0;
    }
    .card-header .name {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
.card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .primary-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .secondary-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
      grid-auto-flow: column;
      gap: 12px;
    }
    .metric {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .metric-label {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .metric.gravity .metric-value {
      color: var(--primary-color);
    }
    .metric.temperature .metric-value {
      color: var(--warning-color, #ff9800);
    }
    .metric.abv .metric-value {
      color: var(--success-color, #4caf50);
    }
    .metric-secondary {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    .delta {
      font-size: 0.75em;
      margin-top: 2px;
      letter-spacing: 0.02em;
      color: var(--primary-text-color);
    }
    .delta.bad {
      color: var(--error-color, #f44336);
    }
    .delta.good {
      color: var(--success-color, #4caf50);
    }
    .graph-wrapper {
      margin: 0 -4px;
    }
    .graph-wrapper > * {
      --ha-card-background: transparent;
      --ha-card-box-shadow: none;
      --ha-card-border-width: 0;
    }
    .graph-missing {
      padding: 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }
    .graph-missing a {
      color: var(--primary-color);
    }
    .unconfigured {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .unconfigured ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.5;
    }
    .unconfigured p {
      margin: 0;
      font-size: 0.9em;
    }
  `;

  public static async getConfigElement() {
    await import("./fermentation-card-editor");
    return document.createElement("fermentation-tracker-card-editor");
  }

  public static getStubConfig(_hass: HomeAssistant): FermentationCardConfig {
    return { type: "custom:fermentation-tracker-card" };
  }

  public setConfig(config: FermentationCardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    this._config = config;
    this._gravityEntityId = config.gravity_entity;
    this._tempEntityIds = config.temperature_entity ?? [];
    this._signalEntityId = config.signal_strength_entity;
    this._batteryEntityId = config.battery_entity;
  }

  public getCardSize(): number {
    return 4;
  }

  protected willUpdate(changedProps: Map<string | symbol, unknown>): void {
    super.willUpdate(changedProps);
    if ((changedProps.has("hass") || changedProps.has("_config")) && this._config?.device_id) {
      const deviceId = this._config.device_id;
      if (!this._config.gravity_entity) {
        this._gravityEntityId = findGravityEntity(this.hass, deviceId);
      }
      if (!this._config.temperature_entity || this._config.temperature_entity.length === 0) {
        const auto = findTemperatureEntity(this.hass, deviceId);
        this._tempEntityIds = auto ? [auto] : [];
      } else {
        this._tempEntityIds = this._config.temperature_entity;
      }
      if (!this._config.signal_strength_entity) {
        this._signalEntityId = findEntityByDeviceClass(this.hass, deviceId, "signal_strength");
      }
      if (!this._config.battery_entity) {
        this._batteryEntityId = findEntityByDeviceClass(this.hass, deviceId, "voltage");
      }
    }

    // Forward hass updates to the embedded history card so it stays live
    if (changedProps.has("hass") && this._historyCard) {
      this._historyCard.hass = this.hass;
    }

    // (Re)create the history card when the tracked entities or chart type change
    if (this._config?.show_graph !== false && this._gravityEntityId) {
      const chartType = this._config?.chart_type ?? "default";
      const mainEntities = [this._gravityEntityId, ...this._tempEntityIds];
      // For default chart, signal/battery stack into the same card.
      // For apex, they get their own card so the gravity/temperature chart isn't cluttered.
      if (chartType === "default" && this._config?.show_device_info) {
        if (this._signalEntityId) mainEntities.push(this._signalEntityId);
        if (this._batteryEntityId) mainEntities.push(this._batteryEntityId);
      }
      const mainKey = `${chartType}::main::${mainEntities.join("|")}`;
      if (mainKey !== this._historyCardKey) {
        this._createHistoryCard(chartType, mainEntities, mainKey);
      }

      // Separate device info chart for apex
      if (chartType === "apex" && this._config?.show_device_info) {
        const infoEntities = [
          this._signalEntityId,
          this._batteryEntityId,
        ].filter((e): e is string => !!e);
        const infoKey = `apex::info::${infoEntities.join("|")}`;
        if (infoEntities.length > 0 && infoKey !== this._deviceInfoCardKey) {
          this._createDeviceInfoCard(infoEntities, infoKey);
        } else if (infoEntities.length === 0) {
          this._deviceInfoCard = undefined;
          this._deviceInfoCardKey = undefined;
        }
      } else if (this._deviceInfoCard) {
        this._deviceInfoCard = undefined;
        this._deviceInfoCardKey = undefined;
      }
    }

    // Forward hass updates to the device info card too
    if (changedProps.has("hass") && this._deviceInfoCard) {
      this._deviceInfoCard.hass = this.hass;
    }

    // Resolve the time range when the gravity entity or range config changes
    if (this._gravityEntityId) {
      const rangeKey = `${this._gravityEntityId}::${this._config?.time_range ?? "auto"}::${this._config?.time_range_custom_hours ?? ""}`;
      if (rangeKey !== this._rangeKey) {
        this._rangeKey = rangeKey;
        this._resolveTimeRange();
      }
    }

    // Refetch historical values (OG + 24h delta baseline) when entities or range change
    if (this._gravityEntityId) {
      const histKey = `${this._resolvedRangeHours}::${[this._gravityEntityId, ...this._tempEntityIds].join("|")}`;
      if (histKey !== this._historicalKey) {
        this._historicalKey = histKey;
        this._fetchHistoricalValues();
      }
    }
  }

  private async _resolveTimeRange(): Promise<void> {
    const range = this._config?.time_range ?? "auto";
    const presetHours: Record<string, number> = {
      "1d": 24,
      "3d": 72,
      "7d": 168,
      "14d": 336,
      "30d": 720,
    };

    let hours: number;
    if (range === "custom") {
      hours = this._config?.time_range_custom_hours ?? 72;
    } else if (range === "auto") {
      hours = await this._detectAutoRangeHours();
    } else {
      hours = presetHours[range] ?? 72;
    }

    if (hours !== this._resolvedRangeHours) {
      this._resolvedRangeHours = hours;
      // Recreate the graph with the new span
      this._historyCardKey = undefined;
      this._deviceInfoCardKey = undefined;
    }
  }

  // Returns only those points that have at least one neighbour within
  // ±SUPPORT_WINDOW_HOURS whose value is within ±SUPPORT_TOLERANCE_SG.
  // Points are assumed sorted ascending by timestamp.
  private _filterIsolated(
    points: { t: number; v: number }[]
  ): { t: number; v: number }[] {
    const winMs =
      FermentationTrackerCard.SUPPORT_WINDOW_HOURS * 60 * 60 * 1000;
    const tol = FermentationTrackerCard.SUPPORT_TOLERANCE_SG;
    const supported: { t: number; v: number }[] = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let hasNeighbour = false;
      // Look forward
      for (let j = i + 1; j < points.length; j++) {
        if (points[j].t - p.t > winMs) break;
        if (Math.abs(points[j].v - p.v) <= tol) {
          hasNeighbour = true;
          break;
        }
      }
      if (!hasNeighbour) {
        // Look backward
        for (let j = i - 1; j >= 0; j--) {
          if (p.t - points[j].t > winMs) break;
          if (Math.abs(points[j].v - p.v) <= tol) {
            hasNeighbour = true;
            break;
          }
        }
      }
      if (hasNeighbour) supported.push(p);
    }
    return supported;
  }

  // Walks forward from rawStartIdx looking for the first window of
  // STABILITY_WINDOW_SIZE consecutive readings whose values are all within
  // STABILITY_TOLERANCE_SG of each other — that's where the iSpindel has
  // settled and the OG reading is meaningful.
  private _findStableStart(
    points: { t: number; v: number }[],
    rawStartIdx: number
  ): number {
    const tolerance = FermentationTrackerCard.STABILITY_TOLERANCE_SG;
    const windowSize = FermentationTrackerCard.STABILITY_WINDOW_SIZE;
    const maxOffsetMs =
      FermentationTrackerCard.STABILITY_MAX_OFFSET_HOURS * 60 * 60 * 1000;
    const rawStartMs = points[rawStartIdx].t;
    const lastIdx = Math.min(points.length - windowSize, points.length - 1);

    for (let i = rawStartIdx; i <= lastIdx; i++) {
      // Bail out if we've drifted too far past the raw start without finding
      // stability — fall back to the raw start so we don't lose the chart.
      if (points[i].t - rawStartMs > maxOffsetMs) break;

      let min = points[i].v;
      let max = points[i].v;
      for (let k = 1; k < windowSize && i + k < points.length; k++) {
        const v = points[i + k].v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      if (max - min <= tolerance) {
        return points[i].t;
      }
    }
    return rawStartMs;
  }

  private async _detectAutoRangeHours(): Promise<number> {
    const log = (msg: string, ...args: unknown[]) =>
      console.log(`[fermentation-tracker][auto-range] ${msg}`, ...args);

    if (!this.hass || !this._gravityEntityId) {
      log("no hass or gravity entity, using fallback");
      return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
    }
    const lookbackMs =
      FermentationTrackerCard.AUTO_DETECT_LOOKBACK_HOURS * 60 * 60 * 1000;
    const start = new Date(Date.now() - lookbackMs);
    const end = new Date();

    log(`fetching gravity history for ${this._gravityEntityId}`, {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    try {
      const result = await this.hass.callWS<
        Record<string, Array<{ s: string; lu?: number; lc?: number }>>
      >({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [this._gravityEntityId],
        minimal_response: true,
        no_attributes: true,
      });
      const states = result[this._gravityEntityId] ?? [];
      log(`raw states received: ${states.length}`);
      if (states.length > 0) {
        log("first 3 raw states:", states.slice(0, 3));
        log("last 3 raw states:", states.slice(-3));
      }

      if (states.length < 2) {
        log("insufficient states, using fallback");
        return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
      }

      // Build a list of plausible-range readings.
      const plausible: { t: number; v: number }[] = [];
      const rejected: Array<{
        reason: string;
        t?: string;
        v?: number;
        raw: unknown;
      }> = [];
      for (const s of states) {
        const tRaw =
          typeof s.lu === "number"
            ? s.lu
            : typeof s.lc === "number"
              ? s.lc
              : 0;
        if (tRaw <= 0) {
          rejected.push({ reason: "no timestamp", raw: s });
          continue;
        }
        const t = tRaw < 1e12 ? tRaw * 1000 : tRaw;
        const v = parseFloat(s.s);
        if (isNaN(v)) {
          rejected.push({
            reason: "NaN value",
            t: new Date(t).toISOString(),
            raw: s,
          });
          continue;
        }
        if (
          v < FermentationTrackerCard.MIN_PLAUSIBLE_SG ||
          v > FermentationTrackerCard.MAX_PLAUSIBLE_SG
        ) {
          rejected.push({
            reason: "out of range",
            t: new Date(t).toISOString(),
            v,
            raw: s,
          });
          continue;
        }
        plausible.push({ t, v });
      }
      log(
        `plausible readings (${plausible.length}) after range filter [${FermentationTrackerCard.MIN_PLAUSIBLE_SG}, ${FermentationTrackerCard.MAX_PLAUSIBLE_SG}], rejected ${rejected.length}`
      );
      if (rejected.length > 0) {
        log("rejected sample (up to 10):", rejected.slice(0, 10));
      }
      if (plausible.length > 0) {
        const fmt = (p: { t: number; v: number }) =>
          `${new Date(p.t).toISOString()} = ${p.v}`;
        log("first 5 plausible:", plausible.slice(0, 5).map(fmt));
        log("last 5 plausible:", plausible.slice(-5).map(fmt));
      }

      if (plausible.length < 2) {
        log("insufficient plausible readings, using fallback");
        return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
      }

      // Drop isolated noise readings.
      const points = this._filterIsolated(plausible);
      const dropped = plausible.length - points.length;
      log(
        `isolation filter dropped ${dropped} readings; ${points.length} supported readings remain`
      );
      if (dropped > 0) {
        const supportedSet = new Set(points.map((p) => p.t));
        const droppedSamples = plausible
          .filter((p) => !supportedSet.has(p.t))
          .slice(0, 10)
          .map((p) => `${new Date(p.t).toISOString()} = ${p.v}`);
        log("dropped as isolated (up to 10):", droppedSamples);
      }

      let workingPoints = points;
      if (workingPoints.length < 2) {
        console.warn(
          "[fermentation-tracker] all plausible readings filtered as isolated; falling back to plausible set"
        );
        workingPoints = plausible;
      }

      const gapMs =
        FermentationTrackerCard.AUTO_DETECT_GAP_HOURS * 60 * 60 * 1000;
      let rawStartIdx = 0;
      let detectedGap: { from: string; to: string; hours: number } | undefined;
      for (let i = workingPoints.length - 1; i > 0; i--) {
        const gap = workingPoints[i].t - workingPoints[i - 1].t;
        if (gap > gapMs) {
          rawStartIdx = i;
          detectedGap = {
            from: new Date(workingPoints[i - 1].t).toISOString(),
            to: new Date(workingPoints[i].t).toISOString(),
            hours: gap / 3600000,
          };
          break;
        }
      }

      if (detectedGap) {
        log(
          `gap detected: ${detectedGap.hours.toFixed(1)}h between ${detectedGap.from} and ${detectedGap.to}`
        );
      } else {
        log(
          `no gap >= ${FermentationTrackerCard.AUTO_DETECT_GAP_HOURS}h found; starting from earliest supported reading`
        );
      }
      log(
        `raw start (after gap detection): ${new Date(workingPoints[rawStartIdx].t).toISOString()} = ${workingPoints[rawStartIdx].v}`
      );

      const stableStartMs = this._findStableStart(workingPoints, rawStartIdx);
      log(
        `stable start (after settling filter): ${new Date(stableStartMs).toISOString()}`
      );
      if (stableStartMs !== workingPoints[rawStartIdx].t) {
        log(
          `settling filter advanced start by ${((stableStartMs - workingPoints[rawStartIdx].t) / 60000).toFixed(0)} minutes`
        );
      }

      const hoursSince = (Date.now() - stableStartMs) / 3600000;
      log(`final fermentation start: ${hoursSince.toFixed(1)}h ago`);

      return Math.max(1, Math.ceil(hoursSince));
    } catch (e) {
      console.error("[fermentation-tracker] auto range detection failed", e);
      return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // Refresh historical baseline every 10 minutes
    this._historicalRefreshTimer = setInterval(
      () => this._fetchHistoricalValues(),
      10 * 60 * 1000
    );
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._historicalRefreshTimer) {
      clearInterval(this._historicalRefreshTimer);
      this._historicalRefreshTimer = undefined;
    }
  }

  private async _fetchHistoricalValues(): Promise<void> {
    if (!this.hass || !this._gravityEntityId) return;

    // OG (gravity at start of graph window) drives attenuation/ABV — always fetch.
    await this._fetchOriginalGravity();

    if (this._config?.show_delta_24h === false) return;

    const entityIds = [this._gravityEntityId, ...this._tempEntityIds];
    if (this._config?.show_device_info) {
      if (this._signalEntityId) entityIds.push(this._signalEntityId);
      if (this._batteryEntityId) entityIds.push(this._batteryEntityId);
    }
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    try {
      const result = await this.hass.callWS<
        Record<string, Array<{ s: string; lu?: number }>>
      >({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: entityIds,
        minimal_response: true,
        no_attributes: true,
      });
      const next: Record<string, number> = {};
      for (const id of entityIds) {
        const states = result[id];
        if (states && states.length > 0) {
          const value = parseFloat(states[0].s);
          if (!isNaN(value)) next[id] = value;
        }
      }
      this._historicalValues = next;
    } catch (e) {
      console.error("[fermentation-tracker] failed to fetch 24h history", e);
    }
  }

  private async _fetchOriginalGravity(): Promise<void> {
    if (!this.hass || !this._gravityEntityId) return;
    const start = new Date(
      Date.now() - this._resolvedRangeHours * 60 * 60 * 1000
    );
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    try {
      const result = await this.hass.callWS<
        Record<string, Array<{ s: string }>>
      >({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [this._gravityEntityId],
        minimal_response: true,
        no_attributes: true,
      });
      const states = result[this._gravityEntityId];
      if (states && states.length > 0) {
        const value = parseFloat(states[0].s);
        this._originalGravity = isNaN(value) ? undefined : value;
      } else {
        this._originalGravity = undefined;
      }
    } catch (e) {
      console.error("[fermentation-tracker] failed to fetch OG", e);
    }
  }

  private async _createHistoryCard(
    chartType: "default" | "apex",
    entities: string[],
    key: string
  ): Promise<void> {
    this._historyCardKey = key;
    const helpers = await (
      window as unknown as {
        loadCardHelpers?: () => Promise<{
          createCardElement: (config: Record<string, unknown>) => HTMLElement & {
            hass?: HomeAssistant;
          };
        }>;
      }
    ).loadCardHelpers?.();
    if (!helpers) return;

    const config =
      chartType === "apex"
        ? this._buildApexConfig()
        : { type: "history-graph", entities, hours_to_show: this._resolvedRangeHours };

    const card = helpers.createCardElement(config);
    card.hass = this.hass;
    this._historyCard = card;
  }

  private _buildApexConfig(): Record<string, unknown> {
    const series: Record<string, unknown>[] = [];
    const yaxis: Record<string, unknown>[] = [];

    if (this._gravityEntityId) {
      series.push({
        entity: this._gravityEntityId,
        name: "Gravity",
        yaxis_id: "gravity",
        stroke_width: 2,
        float_precision: 4,
      });
      yaxis.push({
        id: "gravity",
        decimals: 4,
        apex_config: { tickAmount: 4 },
      });
    }
    if (this._tempEntityIds.length > 0) {
      this._tempEntityIds.forEach((entity) => {
        series.push({
          entity,
          yaxis_id: "temperature",
          stroke_width: 2,
          float_precision: 1,
        });
      });
      yaxis.push({
        id: "temperature",
        decimals: 1,
        opposite: true,
        apex_config: { tickAmount: 4 },
      });
    }

    return {
      type: "custom:apexcharts-card",
      graph_span: `${this._resolvedRangeHours}h`,
      header: { show: false },
      yaxis,
      series,
    };
  }

  private _buildApexDeviceInfoConfig(): Record<string, unknown> {
    const series: Record<string, unknown>[] = [];
    const yaxis: Record<string, unknown>[] = [];

    if (this._signalEntityId) {
      series.push({
        entity: this._signalEntityId,
        name: "Signal",
        yaxis_id: "signal",
        stroke_width: 2,
        float_precision: 0,
      });
      yaxis.push({
        id: "signal",
        decimals: 0,
        apex_config: { tickAmount: 4 },
      });
    }
    if (this._batteryEntityId) {
      series.push({
        entity: this._batteryEntityId,
        name: "Battery",
        yaxis_id: "battery",
        stroke_width: 2,
        float_precision: 2,
      });
      yaxis.push({
        id: "battery",
        decimals: 2,
        opposite: true,
        apex_config: { tickAmount: 4 },
      });
    }

    return {
      type: "custom:apexcharts-card",
      graph_span: `${this._resolvedRangeHours}h`,
      header: { show: false },
      yaxis,
      series,
    };
  }

  private async _createDeviceInfoCard(entities: string[], key: string): Promise<void> {
    this._deviceInfoCardKey = key;
    const helpers = await (
      window as unknown as {
        loadCardHelpers?: () => Promise<{
          createCardElement: (config: Record<string, unknown>) => HTMLElement & {
            hass?: HomeAssistant;
          };
        }>;
      }
    ).loadCardHelpers?.();
    if (!helpers) return;
    void entities;
    const card = helpers.createCardElement(this._buildApexDeviceInfoConfig());
    card.hass = this.hass;
    this._deviceInfoCard = card;
  }

  protected render() {
    if (!this._config) return nothing;

    if (!this._config.device_id) {
      return html`
        <ha-card>
          <div class="unconfigured">
            <ha-icon icon="mdi:flask-outline"></ha-icon>
            <p>Click the edit icon to select your fermentation device.</p>
          </div>
        </ha-card>
      `;
    }

    const gravityState = this._gravityEntityId
      ? this.hass.states[this._gravityEntityId]
      : undefined;

    const gravityRaw = gravityState ? parseFloat(gravityState.state) : undefined;

    const device = this.hass.devices[this._config.device_id];
    const deviceName = device?.name_by_user ?? device?.name ?? "Fermentation Vessel";
    const cardTitle = this._config.name ?? deviceName;

    const displayUnit = this._config.gravity_unit;
    const gravitySecondary = this._formatGravityConverted(gravityRaw, displayUnit);

    const og = this._originalGravity;
    const attenuation = og && gravityRaw ? calcAttenuation(og, gravityRaw) : undefined;
    const abv = og && gravityRaw ? calcAbv(og, gravityRaw) : undefined;

    const gravity24h = this._gravityEntityId
      ? this._historicalValues[this._gravityEntityId]
      : undefined;
    const gravityDelta =
      gravityRaw !== undefined && gravity24h !== undefined
        ? gravityRaw - gravity24h
        : undefined;

    const attenuation24h =
      og && gravity24h ? calcAttenuation(og, gravity24h) : undefined;
    const attenuationDelta =
      attenuation !== undefined && attenuation24h !== undefined
        ? attenuation - attenuation24h
        : undefined;

    const abv24h = og && gravity24h ? calcAbv(og, gravity24h) : undefined;
    const abvDelta =
      abv !== undefined && abv24h !== undefined ? abv - abv24h : undefined;

    const temperatureReadings = this._tempEntityIds
      .map((id) => {
        const state = this.hass.states[id];
        if (!state) return null;
        const value = parseFloat(state.state);
        if (isNaN(value)) return null;
        const uom =
          typeof state.attributes["unit_of_measurement"] === "string"
            ? state.attributes["unit_of_measurement"]
            : "°C";
        const name =
          this.hass.entities[id]?.entity_id === id
            ? state.attributes["friendly_name"]
            : undefined;
        return {
          id,
          name: typeof name === "string" ? name : id,
          value,
          uom,
        };
      })
      .filter((r): r is { id: string; name: string; value: number; uom: string } => r !== null);
    const primaryTemp = temperatureReadings[0];

    const signalState = this._signalEntityId
      ? this.hass.states[this._signalEntityId]
      : undefined;
    const signalValue = signalState ? parseFloat(signalState.state) : undefined;
    const signalUom =
      typeof signalState?.attributes["unit_of_measurement"] === "string"
        ? signalState.attributes["unit_of_measurement"]
        : "dB";
    const signal24h = this._signalEntityId
      ? this._historicalValues[this._signalEntityId]
      : undefined;
    const signalDelta =
      signalValue !== undefined && signal24h !== undefined
        ? signalValue - signal24h
        : undefined;

    const batteryState = this._batteryEntityId
      ? this.hass.states[this._batteryEntityId]
      : undefined;
    const batteryValue = batteryState ? parseFloat(batteryState.state) : undefined;
    const batteryUom =
      typeof batteryState?.attributes["unit_of_measurement"] === "string"
        ? batteryState.attributes["unit_of_measurement"]
        : "V";
    const battery24h = this._batteryEntityId
      ? this._historicalValues[this._batteryEntityId]
      : undefined;
    const batteryDelta =
      batteryValue !== undefined && battery24h !== undefined
        ? batteryValue - battery24h
        : undefined;
    const primaryTemp24h = primaryTemp
      ? this._historicalValues[primaryTemp.id]
      : undefined;
    const tempDelta =
      primaryTemp && primaryTemp24h !== undefined
        ? primaryTemp.value - primaryTemp24h
        : undefined;

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">${cardTitle}</div>
        </div>
        <div class="card-content">
          <div class="primary-metrics">
            <div class="metric gravity">
              <span class="metric-label">Gravity</span>
              <span class="metric-value">
                ${gravityRaw !== undefined && !isNaN(gravityRaw) ? gravityRaw.toFixed(4) : "—"}
              </span>
              ${this._renderDelta(gravityDelta, 4, "down-good")}
              ${gravitySecondary !== undefined
                ? html`<span class="metric-secondary">${gravitySecondary}</span>`
                : nothing}
            </div>
            <div class="metric temperature">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">
                ${primaryTemp
                  ? `${primaryTemp.value.toFixed(1)} ${primaryTemp.uom}`
                  : "—"}
              </span>
              ${this._renderDelta(tempDelta, 1, "neutral")}
            </div>
          </div>

          ${og
            ? html`
                <div class="secondary-metrics">
                  <div class="metric">
                    <span class="metric-label">OG</span>
                    <span class="metric-value">${og.toFixed(3)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Attenuation</span>
                    <span class="metric-value">
                      ${attenuation !== undefined ? `${attenuation.toFixed(1)}%` : "—"}
                    </span>
                    ${this._renderDelta(attenuationDelta, 1, "up-good", "%")}
                  </div>
                  <div class="metric abv">
                    <span class="metric-label">ABV</span>
                    <span class="metric-value">
                      ${abv !== undefined ? `${abv.toFixed(2)}%` : "—"}
                    </span>
                    ${this._renderDelta(abvDelta, 2, "up-good", "%")}
                  </div>
                </div>
              `
            : nothing}

          ${this._config.show_device_info
            ? html`
                <div class="secondary-metrics">
                  <div class="metric">
                    <span class="metric-label">Signal</span>
                    <span class="metric-value">
                      ${signalValue !== undefined && !isNaN(signalValue)
                        ? `${signalValue.toFixed(0)} ${signalUom}`
                        : "—"}
                    </span>
                    ${this._renderDelta(signalDelta, 0, "neutral", ` ${signalUom}`)}
                  </div>
                  <div class="metric">
                    <span class="metric-label">Battery</span>
                    <span class="metric-value">
                      ${batteryValue !== undefined && !isNaN(batteryValue)
                        ? `${batteryValue.toFixed(2)} ${batteryUom}`
                        : "—"}
                    </span>
                    ${this._renderDelta(batteryDelta, 2, "neutral", ` ${batteryUom}`)}
                  </div>
                </div>
              `
            : nothing}

          ${this._config.show_graph !== false
            ? this._config.chart_type === "apex" &&
              !customElements.get("apexcharts-card")
              ? html`<div class="graph-missing">
                  ApexCharts not installed. Install
                  <a
                    href="https://github.com/RomRider/apexcharts-card"
                    target="_blank"
                    rel="noopener"
                    >apexcharts-card</a
                  >
                  via HACS or switch chart style back to default.
                </div>`
              : html`
                  ${this._historyCard
                    ? html`<div class="graph-wrapper">${this._historyCard}</div>`
                    : nothing}
                  ${this._deviceInfoCard
                    ? html`<div class="graph-wrapper">${this._deviceInfoCard}</div>`
                    : nothing}
                `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  // direction:
  //   "down-good": gravity — falling SG is fermentation progress (green)
  //   "up-good":   attenuation, ABV — rising values are progress (green)
  //   "neutral":   temperature — no semantic, no colour
  private _renderDelta(
    delta: number | undefined,
    decimals: number,
    direction: "up-good" | "down-good" | "neutral",
    suffix = ""
  ) {
    if (this._config?.show_delta_24h === false) return nothing;
    if (delta === undefined || isNaN(delta)) return nothing;

    const tooltip = "Change in the last 24 hours";

    if (delta === 0) {
      return html`<span class="delta" title=${tooltip}>±0${suffix}</span>`;
    }

    const up = delta > 0;
    const arrow = up ? "▲" : "▼";
    const sign = up ? "+" : "−";

    let cls = "delta";
    if (direction === "up-good") cls += up ? " good" : " bad";
    else if (direction === "down-good") cls += up ? " bad" : " good";

    return html`<span class="${cls}" title=${tooltip}>
      ${arrow} ${sign}${Math.abs(delta).toFixed(decimals)}${suffix}
    </span>`;
  }

  private _formatGravityConverted(
    sg: number | undefined,
    unit: string | undefined
  ): string | undefined {
    if (sg === undefined || isNaN(sg) || !unit) return undefined;
    if (unit === "Plato") return `${sgToPlato(sg).toFixed(1)} °P`;
    if (unit === "Brix") return `${sgToBrix(sg).toFixed(1)} °Bx`;
    return undefined;
  }
}
