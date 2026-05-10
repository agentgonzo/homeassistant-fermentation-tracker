import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, FermentationCardConfig } from "./types";
import { KNOWN_FERMENTATION_DOMAINS } from "./const";

declare global {
  interface HTMLElementTagNameMap {
    "fermentation-tracker-card-editor": FermentationCardEditor;
  }
}

type HaFormSchema = ReadonlyArray<Record<string, unknown>>;

const computeLabel = (schema: { name: string }): string => {
  switch (schema.name) {
    case "device_id":
      return "Fermentation Device";
    case "name":
      return "Card title (optional)";
    case "gravity_unit":
      return "Also show gravity as";
    case "original_gravity":
      return "Original Gravity (SG)";
    case "show_graph":
      return "Show gravity trend graph";
    case "gravity_entity":
      return "Gravity entity (auto-detected if blank)";
    case "temperature_entity":
      return "Temperature entity (auto-detected if blank)";
    default:
      return schema.name;
  }
};

@customElement("fermentation-tracker-card-editor")
export class FermentationCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: FermentationCardConfig;

  static styles = css`
    :host {
      display: block;
    }
    ha-form {
      display: block;
      padding: 16px 0;
    }
  `;

  public setConfig(config: FermentationCardConfig): void {
    this._config = config;
  }

  private _buildSchema(deviceId: string | undefined): HaFormSchema {
    const fermentationFilters = [...KNOWN_FERMENTATION_DOMAINS].map((domain) => ({
      integration: domain,
    }));

    const baseSchema: Array<Record<string, unknown>> = [
      {
        name: "device_id",
        required: true,
        selector: {
          device: { filter: fermentationFilters },
        },
      },
    ];

    if (deviceId) {
      baseSchema.push(
        { name: "name", selector: { text: {} } },
        {
          name: "gravity_unit",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "", label: "SG only" },
                { value: "Plato", label: "+ Plato (°P)" },
                { value: "Brix", label: "+ Brix (°Bx)" },
              ],
            },
          },
        },
        {
          name: "original_gravity",
          selector: {
            number: { min: 0.99, max: 1.2, step: 0.001, mode: "box" },
          },
        },
        { name: "show_graph", selector: { boolean: {} } },
        {
          name: "gravity_entity",
          selector: {
            entity: {
              domain: "sensor",
              filter: { device_id: deviceId },
            },
          },
        },
        {
          name: "temperature_entity",
          selector: {
            entity: {
              domain: "sensor",
              filter: { device_id: deviceId },
            },
          },
        }
      );
    }

    return baseSchema;
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    const schema = this._buildSchema(this._config.device_id);
    // Strip undefined values so ha-form treats them as "not set"
    const data = Object.fromEntries(
      Object.entries(this._config).filter(([, v]) => v !== undefined)
    );

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config) return;
    const newConfig = { ...this._config, ...ev.detail.value };

    // Normalise empty strings to undefined for cleaner stored config
    for (const key of Object.keys(newConfig) as Array<
      keyof FermentationCardConfig
    >) {
      if (newConfig[key] === "" || newConfig[key] === null) {
        newConfig[key] = undefined as never;
      }
    }

    // If the device changed, drop entity overrides so auto-discovery runs
    if (newConfig.device_id !== this._config.device_id) {
      newConfig.gravity_entity = undefined;
      newConfig.temperature_entity = undefined;
    }

    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }
}
