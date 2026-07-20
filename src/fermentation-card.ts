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
  // Linear-regression slope of gravity over the last 24h, in SG per hour.
  // Used to decide whether fermentation has finished (slope * 24 > -0.0002).
  @state() private _gravitySlope24h?: number;
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
  // Fermentation is considered finished when the trend over the last 24h is
  // dropping by less than this much SG (or rising). 0.0002 is well within
  // the noise floor of an iSpindel.
  private static readonly FERMENTATION_FINISHED_THRESHOLD_SG = 0.0002;
  // Need at least this many points in the 24h window for a meaningful slope.
  private static readonly TREND_MIN_POINTS = 5;

  // A plausible reading is dropped if there's an out-of-range "junk" reading
  // within ±this many minutes — a strong signal that the iSpindel was being
  // moved or settling, even though one stray reading happened to land in range.
  // 60 min is empirically enough for an iSpindel to fully settle after being
  // placed in wort (the brief in-range readings during the first hour can look
  // stable but are still drifting toward the true wort SG).
  private static readonly JUNK_PROXIMITY_MINUTES = 60;

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
    .status {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 0.85em;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-active .status-dot {
      background: var(--warning-color, #ff9800);
      box-shadow: 0 0 0 0 currentColor;
      animation: status-pulse 2.4s ease-out infinite;
      color: var(--warning-color, #ff9800);
    }
    .status-finished .status-dot {
      background: var(--success-color, #4caf50);
    }
    @keyframes status-pulse {
      0%   { box-shadow: 0 0 0 0 currentColor; }
      80%  { box-shadow: 0 0 0 8px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }
    .status-text {
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .status-detail {
      margin-left: auto;
      color: var(--secondary-text-color);
      font-size: 0.92em;
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
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric.clickable {
      cursor: pointer;
    }
    .metric.clickable:hover {
      background: var(--secondary-background-color);
      filter: brightness(0.9);
    }
    .metric-label {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
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
    .metric-value.battery-ok {
      color: var(--success-color, #4caf50);
    }
    .metric-value.battery-warn {
      color: var(--warning-color, #ffc107);
    }
    .metric-value.battery-low {
      color: #ff9800;
    }
    .metric-value.battery-crit {
      color: var(--error-color, #f44336);
    }
    .metric-secondary {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    .delta {
      font-size: 0.75em;
      letter-spacing: 0.02em;
      color: var(--primary-text-color);
      white-space: nowrap;
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
    .no-activity {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 8px;
      text-align: center;
    }
    .no-activity ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.5;
      color: var(--secondary-text-color);
    }
    .no-activity-title {
      margin: 0;
      font-size: 1.1em;
      color: var(--primary-text-color);
    }
    .no-activity-detail {
      margin: 0;
      font-size: 0.9em;
      color: var(--secondary-text-color);
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
        this._batteryEntityId =
          findEntityByDeviceClass(this.hass, deviceId, "battery") ??
          findEntityByDeviceClass(this.hass, deviceId, "voltage");
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
      const rangeKey = `${this._gravityEntityId}::${this._config?.time_range ?? "auto"}::${this._config?.fermentation_start ?? ""}`;
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

    let hours: number;
    if (range === "auto") {
      hours = await this._detectAutoRangeHours();
    } else {
      // "now" and "custom" both anchor to an absolute start timestamp — the
      // window grows from there up to the present, rather than being a
      // fixed-size lookback.
      const startMs = this._config?.fermentation_start
        ? new Date(this._config.fermentation_start).getTime()
        : NaN;
      hours = isNaN(startMs)
        ? FermentationTrackerCard.AUTO_FALLBACK_HOURS
        : Math.max(1, Math.ceil((Date.now() - startMs) / 3600000));
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
    if (!this.hass || !this._gravityEntityId) {
      return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
    }
    const lookbackMs =
      FermentationTrackerCard.AUTO_DETECT_LOOKBACK_HOURS * 60 * 60 * 1000;
    const start = new Date(Date.now() - lookbackMs);
    const end = new Date();
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
      if (states.length < 2) {
        return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
      }

      // Parse readings into plausible (in-range) and junk (out-of-range)
      // timestamps. Out-of-range readings mark iSpindel disturbance windows.
      const plausible: { t: number; v: number }[] = [];
      const junkTimes: number[] = [];
      for (const s of states) {
        const tRaw =
          typeof s.lu === "number"
            ? s.lu
            : typeof s.lc === "number"
              ? s.lc
              : 0;
        if (tRaw <= 0) continue;
        const t = tRaw < 1e12 ? tRaw * 1000 : tRaw;
        const v = parseFloat(s.s);
        if (isNaN(v)) continue;
        if (
          v < FermentationTrackerCard.MIN_PLAUSIBLE_SG ||
          v > FermentationTrackerCard.MAX_PLAUSIBLE_SG
        ) {
          junkTimes.push(t);
          continue;
        }
        plausible.push({ t, v });
      }
      if (plausible.length < 2) {
        return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
      }

      // Drop plausible readings that have a junk reading within ±60 minutes.
      // The iSpindel can take up to an hour to settle after being moved, and
      // brief in-range readings during that period can look stable but are
      // still drifting toward the true wort SG. Only applied when the user
      // has enabled filter_settling.
      let cleanFromJunk = plausible;
      if (this._config?.filter_settling && junkTimes.length > 0) {
        const proxMs =
          FermentationTrackerCard.JUNK_PROXIMITY_MINUTES * 60 * 1000;
        const sortedJunk = [...junkTimes].sort((a, b) => a - b);
        cleanFromJunk = plausible.filter((p) => {
          let lo = 0;
          let hi = sortedJunk.length - 1;
          let closest = Infinity;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const diff = sortedJunk[mid] - p.t;
            if (Math.abs(diff) < closest) closest = Math.abs(diff);
            if (diff < 0) lo = mid + 1;
            else if (diff > 0) hi = mid - 1;
            else return false;
          }
          return closest > proxMs;
        });
      }

      // Drop readings with no nearby same-value neighbour — catches one-off
      // readings that briefly fall into the plausible band.
      const points = this._filterIsolated(cleanFromJunk);
      const workingPoints = points.length >= 2 ? points : plausible;

      // Find the most recent gap >= AUTO_DETECT_GAP_HOURS in the cleaned set.
      const gapMs =
        FermentationTrackerCard.AUTO_DETECT_GAP_HOURS * 60 * 60 * 1000;
      let rawStartIdx = 0;
      for (let i = workingPoints.length - 1; i > 0; i--) {
        if (workingPoints[i].t - workingPoints[i - 1].t > gapMs) {
          rawStartIdx = i;
          break;
        }
      }

      const stableStartMs = this._findStableStart(workingPoints, rawStartIdx);
      const hoursSince = (Date.now() - stableStartMs) / 3600000;
      return Math.max(1, Math.ceil(hoursSince));
    } catch (e) {
      console.error("[fermentation-tracker] auto range detection failed", e);
      return FermentationTrackerCard.AUTO_FALLBACK_HOURS;
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // Every 10 minutes: refresh the historical baseline, and re-resolve the
    // time range so a "now"/"custom" start keeps growing towards the present
    // instead of freezing at whatever width it had on first load.
    this._historicalRefreshTimer = setInterval(() => {
      void this._resolveTimeRange();
      this._fetchHistoricalValues();
    }, 10 * 60 * 1000);
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
    // 24h trend slope drives the fermentation-finished tile — always fetch.
    await this._fetchTrendSlope();

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

  // Fetches the last 24h of gravity readings and computes the linear-
  // regression slope (SG per hour). Used to decide whether fermentation
  // has finished — relying on the slope rather than first/last values
  // smooths over reading noise.
  private async _fetchTrendSlope(): Promise<void> {
    if (!this.hass || !this._gravityEntityId) return;
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = new Date();
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
      // Filter to plausible-range readings only — junk skews the slope.
      const points: { t: number; v: number }[] = [];
      for (const s of states) {
        const tRaw =
          typeof s.lu === "number"
            ? s.lu
            : typeof s.lc === "number"
              ? s.lc
              : 0;
        if (tRaw <= 0) continue;
        const t = tRaw < 1e12 ? tRaw * 1000 : tRaw;
        const v = parseFloat(s.s);
        if (isNaN(v)) continue;
        if (
          v < FermentationTrackerCard.MIN_PLAUSIBLE_SG ||
          v > FermentationTrackerCard.MAX_PLAUSIBLE_SG
        ) {
          continue;
        }
        points.push({ t, v });
      }
      if (points.length < FermentationTrackerCard.TREND_MIN_POINTS) {
        this._gravitySlope24h = undefined;
        return;
      }

      // Linear regression: slope of SG vs time-in-hours, with t=0 anchored
      // at the first point to keep the numbers small.
      const t0 = points[0].t;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumX2 = 0;
      const n = points.length;
      for (const p of points) {
        const x = (p.t - t0) / 3600000;
        const y = p.v;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }
      const denom = n * sumX2 - sumX * sumX;
      if (denom === 0) {
        this._gravitySlope24h = undefined;
        return;
      }
      this._gravitySlope24h = (n * sumXY - sumX * sumY) / denom;
    } catch (e) {
      console.error("[fermentation-tracker] failed to fetch trend slope", e);
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

    // "No activity" placeholder: if the gravity entity exists but hasn't been
    // updated in over 24h, the device has likely gone offline. Hide all metrics
    // so stale readings don't masquerade as current.
    const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
    const gravityLastUpdated = gravityState?.last_updated
      ? new Date(gravityState.last_updated).getTime()
      : undefined;
    const isStale =
      gravityState !== undefined &&
      gravityLastUpdated !== undefined &&
      Date.now() - gravityLastUpdated > STALE_THRESHOLD_MS;

    if (isStale) {
      return html`
        <ha-card>
          <div class="card-header">
            <div class="name">${cardTitle}</div>
          </div>
          <div class="no-activity">
            <ha-icon icon="mdi:sleep"></ha-icon>
            <p class="no-activity-title">No activity</p>
            <p class="no-activity-detail">
              Last reading ${this._formatRelativeTime(gravityLastUpdated!)}
            </p>
          </div>
        </ha-card>
      `;
    }

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

    // Fermentation finished detection — based on the 24h regression slope, not
    // raw values, so it's robust to reading noise. Returns:
    //   - "active": gravity dropping faster than threshold over 24h
    //   - "finished": flat or rising trend (or below threshold drop)
    //   - undefined: not enough data yet (less than TREND_MIN_POINTS)
    const slopePerHour = this._gravitySlope24h;
    const change24h = slopePerHour !== undefined ? slopePerHour * 24 : undefined;
    const fermentationStatus: "active" | "finished" | undefined =
      change24h === undefined
        ? undefined
        : change24h > -(this._config?.finished_threshold ?? FermentationTrackerCard.FERMENTATION_FINISHED_THRESHOLD_SG)
          ? "finished"
          : "active";

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">${cardTitle}</div>
        </div>
        <div class="card-content">
          ${fermentationStatus
            ? html`
                <div class="status status-${fermentationStatus}" title=${`24h gravity trend: ${change24h !== undefined ? change24h.toFixed(4) : "—"} SG`}>
                  <span class="status-dot"></span>
                  <span class="status-text">
                    ${fermentationStatus === "active"
                      ? "Fermenting"
                      : "Fermentation complete"}
                  </span>
                  ${change24h !== undefined
                    ? html`<span class="status-detail">
                        ${change24h >= 0 ? "+" : "−"}${Math.abs(change24h).toFixed(4)} SG / 24h
                      </span>`
                    : nothing}
                </div>
              `
            : nothing}

          <div class="primary-metrics">
            <div class="metric gravity${this._gravityEntityId ? " clickable" : ""}" @click=${() => this._showMoreInfo(this._gravityEntityId)}>
              <span class="metric-label">Gravity</span>
              <div class="metric-row">
                <span class="metric-value">
                  ${gravityRaw !== undefined && !isNaN(gravityRaw) ? gravityRaw.toFixed(4) : "—"}
                </span>
                ${this._renderDelta(gravityDelta, 4, "down-good")}
              </div>
              ${gravitySecondary !== undefined
                ? html`<span class="metric-secondary">${gravitySecondary}</span>`
                : nothing}
            </div>
            <div class="metric temperature${this._tempEntityIds[0] ? " clickable" : ""}" @click=${() => this._showMoreInfo(this._tempEntityIds[0])}>
              <span class="metric-label">Temperature</span>
              <div class="metric-row">
                <span class="metric-value">
                  ${primaryTemp
                    ? `${primaryTemp.value.toFixed(1)} ${primaryTemp.uom}`
                    : "—"}
                </span>
                ${this._renderDelta(tempDelta, 1, "neutral")}
              </div>
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
                    <div class="metric-row">
                      <span class="metric-value">
                        ${attenuation !== undefined ? `${attenuation.toFixed(1)}%` : "—"}
                      </span>
                      ${this._renderDelta(attenuationDelta, 1, "up-good", "%")}
                    </div>
                  </div>
                  <div class="metric abv">
                    <span class="metric-label">ABV</span>
                    <div class="metric-row">
                      <span class="metric-value">
                        ${abv !== undefined ? `${abv.toFixed(2)}%` : "—"}
                      </span>
                      ${this._renderDelta(abvDelta, 2, "up-good", "%")}
                    </div>
                  </div>
                </div>
              `
            : nothing}

          ${this._config.show_device_info
            ? html`
                <div class="secondary-metrics">
                  <div class="metric${this._signalEntityId ? " clickable" : ""}" @click=${() => this._showMoreInfo(this._signalEntityId)}>
                    <span class="metric-label">Signal</span>
                    <div class="metric-row">
                      <span class="metric-value">
                        ${signalValue !== undefined && !isNaN(signalValue)
                          ? `${signalValue.toFixed(0)} ${signalUom}`
                          : "—"}
                      </span>
                      ${this._renderDelta(signalDelta, 0, "neutral", ` ${signalUom}`)}
                    </div>
                  </div>
                  <div class="metric${this._batteryEntityId ? " clickable" : ""}" @click=${() => this._showMoreInfo(this._batteryEntityId)}>
                    <span class="metric-label">Battery</span>
                    <div class="metric-row">
                      <span class="metric-value ${this._batteryColorClass(batteryValue, batteryUom)}">
                        ${batteryValue !== undefined && !isNaN(batteryValue)
                          ? `${batteryValue.toFixed(2)} ${batteryUom}`
                          : "—"}
                      </span>
                      ${this._renderDelta(batteryDelta, 2, "neutral", ` ${batteryUom}`)}
                    </div>
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
  private _showMoreInfo(entityId: string | undefined) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }

  private _formatRelativeTime(timestampMs: number): string {
    const diffMs = Date.now() - timestampMs;
    const minutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    if (weeks >= 2) return `${weeks} weeks ago`;
    if (days >= 2) return `${days} days ago`;
    if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    if (minutes >= 1) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    return "just now";
  }

  private _batteryColorClass(value: number | undefined, uom: string): string {
    if (value === undefined || isNaN(value) || uom !== "%") return "";
    if (value >= 60) return "battery-ok";
    if (value >= 30) return "battery-warn";
    if (value >= 15) return "battery-low";
    return "battery-crit";
  }

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
