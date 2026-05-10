import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, FermentationCardConfig } from "./types";

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
      return "Show trend graph";
    case "chart_type":
      return "Chart style";
    case "gravity_entity":
      return "Gravity entity (auto-detected if blank)";
    case "temperature_entity":
      return "Temperature entities (auto-detected if blank)";
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

  private _measurementSensorsForDevice(deviceId: string): string[] {
    return Object.values(this.hass.entities)
      .filter(
        (e) =>
          e.device_id === deviceId &&
          e.entity_id.startsWith("sensor.") &&
          !e.hidden &&
          this.hass.states[e.entity_id]?.attributes["state_class"] ===
            "measurement"
      )
      .map((e) => e.entity_id);
  }

  private _buildSchema(deviceId: string | undefined): HaFormSchema {
    // We don't filter the device list because users running iSpindel/Tilt via
    // MQTT discovery have integration=mqtt rather than ispindel/tilt_ble, and
    // ha-form's device selector doesn't support custom filter callbacks.
    // The auto-discovery of gravity/temperature entities handles validation.
    const baseSchema: Array<Record<string, unknown>> = [
      {
        name: "device_id",
        required: true,
        selector: {
          device: {},
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
          name: "chart_type",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "default", label: "Default (HA history graph)" },
                { value: "apex", label: "ApexCharts (dual axis, requires apexcharts-card)" },
              ],
            },
          },
        },
        {
          name: "gravity_entity",
          selector: {
            entity: {
              include_entities: this._measurementSensorsForDevice(deviceId),
            },
          },
        },
        {
          name: "temperature_entity",
          selector: {
            entity: {
              multiple: true,
              filter: { device_class: "temperature" },
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
