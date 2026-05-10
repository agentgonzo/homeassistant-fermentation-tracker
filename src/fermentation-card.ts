import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, FermentationCardConfig } from "./types";
import { findGravityEntity, findTemperatureEntity } from "./utils/entity-discovery";
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
  @state() private _tempEntityId?: string;
  @state() private _historyCard?: HTMLElement & { hass?: HomeAssistant };
  private _historyCardKey?: string;

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
      grid-template-columns: repeat(3, 1fr);
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
    .graph-wrapper {
      margin: 0 -4px;
    }
    .graph-wrapper > * {
      --ha-card-background: transparent;
      --ha-card-box-shadow: none;
      --ha-card-border-width: 0;
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
    this._tempEntityId = config.temperature_entity;
  }

  public getCardSize(): number {
    return 4;
  }

  protected willUpdate(changedProps: Map<string | symbol, unknown>): void {
    super.willUpdate(changedProps);
    if ((changedProps.has("hass") || changedProps.has("_config")) && this._config?.device_id) {
      if (!this._config.gravity_entity) {
        this._gravityEntityId = findGravityEntity(this.hass, this._config.device_id);
      }
      if (!this._config.temperature_entity) {
        this._tempEntityId = findTemperatureEntity(this.hass, this._config.device_id);
      }
    }

    // Forward hass updates to the embedded history card so it stays live
    if (changedProps.has("hass") && this._historyCard) {
      this._historyCard.hass = this.hass;
    }

    // (Re)create the history card when the tracked entities change
    if (this._config?.show_graph !== false && this._gravityEntityId) {
      const entities = [this._gravityEntityId, this._tempEntityId].filter(
        (e): e is string => !!e
      );
      const key = entities.join("|");
      if (key !== this._historyCardKey) {
        this._createHistoryCard(entities, key);
      }
    }
  }

  private async _createHistoryCard(
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
    const card = helpers.createCardElement({
      type: "history-graph",
      entities,
      hours_to_show: 72,
    });
    card.hass = this.hass;
    this._historyCard = card;
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
    const tempState = this._tempEntityId
      ? this.hass.states[this._tempEntityId]
      : undefined;

    const gravityRaw = gravityState ? parseFloat(gravityState.state) : undefined;
    const tempRaw = tempState ? parseFloat(tempState.state) : undefined;

    const device = this.hass.devices[this._config.device_id];
    const deviceName = device?.name_by_user ?? device?.name ?? "Fermentation Vessel";
    const cardTitle = this._config.name ?? deviceName;

    const displayUnit = this._config.gravity_unit;
    const gravitySecondary = this._formatGravityConverted(gravityRaw, displayUnit);

    const og = this._config.original_gravity;
    const attenuation = og && gravityRaw ? calcAttenuation(og, gravityRaw) : undefined;
    const abv = og && gravityRaw ? calcAbv(og, gravityRaw) : undefined;

    const tempUom = typeof tempState?.attributes["unit_of_measurement"] === "string"
      ? tempState.attributes["unit_of_measurement"]
      : "°C";

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
              ${gravitySecondary !== undefined
                ? html`<span class="metric-secondary">${gravitySecondary}</span>`
                : nothing}
            </div>
            <div class="metric temperature">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">
                ${tempRaw !== undefined ? `${tempRaw.toFixed(1)} ${tempUom}` : "—"}
              </span>
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
                  </div>
                  <div class="metric abv">
                    <span class="metric-label">ABV</span>
                    <span class="metric-value">
                      ${abv !== undefined ? `${abv.toFixed(2)}%` : "—"}
                    </span>
                  </div>
                </div>
              `
            : nothing}

          ${this._config.show_graph !== false && this._historyCard
            ? html`<div class="graph-wrapper">${this._historyCard}</div>`
            : nothing}
        </div>
      </ha-card>
    `;
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
