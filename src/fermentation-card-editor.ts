import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import type { HomeAssistant, FermentationCardConfig, DeviceRegistryEntry } from "./types";
import { KNOWN_FERMENTATION_DOMAINS } from "./const";
import { deviceHasGravityEntity } from "./utils/entity-discovery";

type ConfigEntry = { entry_id: string; domain: string };

declare global {
  interface HTMLElementTagNameMap {
    "fermentation-tracker-card-editor": FermentationCardEditor;
  }
}

@customElement("fermentation-tracker-card-editor")
export class FermentationCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: FermentationCardConfig;
  @state() private _configEntryDomains: Record<string, string> = {};
  @state() private _componentsReady = false;

  static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    ha-device-picker,
    ha-textfield,
    ha-select {
      display: block;
      width: 100%;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .row > * {
      flex: 1;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      margin: 0;
    }
    .section-label {
      font-size: 0.85em;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: -8px;
    }
  `;

  public setConfig(config: FermentationCardConfig): void {
    this._config = config;
  }

  protected async firstUpdated(): Promise<void> {
    await this._loadHaComponents();

    const entries = await this.hass.callWS<ConfigEntry[]>({
      type: "config_entries/get",
    });
    this._configEntryDomains = Object.fromEntries(
      entries.map((e) => [e.entry_id, e.domain])
    );
    this._componentsReady = true;
  }

  // HA lazy-loads picker components only when a built-in card's editor opens.
  // This trick instantiates a built-in card and asks for its config element,
  // which transitively registers ha-device-picker / ha-entity-picker etc.
  private async _loadHaComponents(): Promise<void> {
    if (
      customElements.get("ha-device-picker") &&
      customElements.get("ha-entity-picker")
    ) {
      return;
    }
    const win = window as unknown as {
      loadCardHelpers?: () => Promise<{
        createCardElement: (config: { type: string }) => HTMLElement & {
          constructor: { getConfigElement?: () => Promise<HTMLElement> };
        };
      }>;
    };
    const helpers = await win.loadCardHelpers?.();
    if (!helpers) return;
    try {
      const card = helpers.createCardElement({
        type: "entities",
        entities: [],
      } as { type: string });
      await card.constructor.getConfigElement?.();
    } catch {
      // Ignore — registration of picker elements happens as a side effect
      // of loading the editor module, even if setConfig errors.
    }
  }

  private _deviceFilter = memoizeOne(
    (configEntryDomains: Record<string, string>) =>
      (device: DeviceRegistryEntry): boolean => {
        // Stage 1: known fermentation integration domain
        const primaryEntry = device.primary_config_entry;
        if (primaryEntry) {
          const domain = configEntryDomains[primaryEntry];
          if (domain && KNOWN_FERMENTATION_DOMAINS.has(domain)) return true;
        }
        const knownByEntry = device.config_entries.some((entryId) => {
          const domain = configEntryDomains[entryId];
          return domain !== undefined && KNOWN_FERMENTATION_DOMAINS.has(domain);
        });
        if (knownByEntry) return true;

        // Stage 2: device has a gravity sensor entity
        return deviceHasGravityEntity(this.hass, device.id);
      }
  );

  protected render() {
    if (!this.hass || !this._config) return nothing;
    if (!this._componentsReady) {
      return html`<div class="card-config"><p class="hint">Loading…</p></div>`;
    }

    const deviceFilter = this._deviceFilter(this._configEntryDomains);

    return html`
      <div class="card-config">
        <ha-device-picker
          .hass=${this.hass}
          .value=${this._config.device_id ?? ""}
          .label=${"Fermentation Device"}
          .deviceFilter=${deviceFilter}
          @value-changed=${this._deviceChanged}
        ></ha-device-picker>

        ${this._config.device_id
          ? html`
              <ha-textfield
                .label=${"Card title (optional)"}
                .value=${this._config.name ?? ""}
                .configValue=${"name"}
                @change=${this._valueChanged}
              ></ha-textfield>

              <div class="row">
                <ha-select
                  .label=${"Also show gravity as"}
                  .value=${this._config.gravity_unit ?? ""}
                  .configValue=${"gravity_unit"}
                  @selected=${this._selectChanged}
                  @closed=${(e: Event) => e.stopPropagation()}
                >
                  <mwc-list-item value="">SG only</mwc-list-item>
                  <mwc-list-item value="Plato">+ Plato (°P)</mwc-list-item>
                  <mwc-list-item value="Brix">+ Brix (°Bx)</mwc-list-item>
                </ha-select>

                <ha-textfield
                  type="number"
                  .label=${"Original Gravity (SG)"}
                  .value=${this._config.original_gravity?.toString() ?? ""}
                  .configValue=${"original_gravity"}
                  placeholder="e.g. 1.052"
                  min="0.990"
                  max="1.200"
                  step="0.001"
                  @change=${this._numberChanged}
                ></ha-textfield>
              </div>

              <ha-formfield .label=${"Show gravity trend graph"}>
                <ha-switch
                  .checked=${this._config.show_graph !== false}
                  .configValue=${"show_graph"}
                  @change=${this._switchChanged}
                ></ha-switch>
              </ha-formfield>

              <div class="section-label">Entity overrides (optional)</div>

              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._config.gravity_entity ?? ""}
                .label=${"Gravity entity (auto-detected if blank)"}
                .configValue=${"gravity_entity"}
                allow-custom-entity
                @value-changed=${this._entityPickerChanged}
              ></ha-entity-picker>

              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._config.temperature_entity ?? ""}
                .label=${"Temperature entity (auto-detected if blank)"}
                .configValue=${"temperature_entity"}
                allow-custom-entity
                @value-changed=${this._entityPickerChanged}
              ></ha-entity-picker>
            `
          : html`<p class="hint">Select a fermentation device above to configure the card.</p>`}
      </div>
    `;
  }

  private _deviceChanged(ev: CustomEvent) {
    ev.stopPropagation();
    if (!this._config) return;
    const deviceId = ev.detail.value as string;
    this._fireConfigChanged({
      ...this._config,
      device_id: deviceId || undefined,
      gravity_entity: undefined,
      temperature_entity: undefined,
    });
  }

  private _valueChanged(ev: Event) {
    if (!this._config) return;
    const target = ev.target as HTMLInputElement & { configValue: keyof FermentationCardConfig };
    this._fireConfigChanged({ ...this._config, [target.configValue]: target.value });
  }

  private _numberChanged(ev: Event) {
    if (!this._config) return;
    const target = ev.target as HTMLInputElement & { configValue: keyof FermentationCardConfig };
    const value = target.value ? parseFloat(target.value) : undefined;
    this._fireConfigChanged({ ...this._config, [target.configValue]: value });
  }

  private _selectChanged(ev: CustomEvent) {
    ev.stopPropagation();
    if (!this._config) return;
    const target = ev.target as HTMLElement & { configValue: keyof FermentationCardConfig; value: string };
    const value = target.value || undefined;
    this._fireConfigChanged({ ...this._config, [target.configValue]: value });
  }

  private _switchChanged(ev: Event) {
    if (!this._config) return;
    const target = ev.target as HTMLInputElement & { configValue: keyof FermentationCardConfig; checked: boolean };
    this._fireConfigChanged({ ...this._config, [target.configValue]: target.checked });
  }

  private _entityPickerChanged(ev: CustomEvent) {
    ev.stopPropagation();
    if (!this._config) return;
    const target = ev.target as HTMLElement & { configValue: keyof FermentationCardConfig };
    const value = (ev.detail.value as string) || undefined;
    this._fireConfigChanged({ ...this._config, [target.configValue]: value });
  }

  private _fireConfigChanged(config: FermentationCardConfig) {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }
}
