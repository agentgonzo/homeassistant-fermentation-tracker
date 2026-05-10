export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  primary_config_entry: string | null;
  manufacturer: string | null;
  model: string | null;
  name: string | null;
  name_by_user: string | null;
  area_id: string | null;
  disabled_by: string | null;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  device_id?: string;
  platform?: string;
  hidden?: boolean;
  entity_category?: string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, { area_id: string; name: string }>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  themes: { darkMode: boolean };
}

export interface FermentationCardConfig {
  type: string;
  device_id?: string;
  name?: string;
  gravity_entity?: string;
  temperature_entity?: string[];
  show_device_info?: boolean;
  signal_strength_entity?: string;
  battery_entity?: string;
  show_graph?: boolean;
  show_delta_24h?: boolean;
  chart_type?: "default" | "apex";
  gravity_unit?: "SG" | "Plato" | "Brix";
  original_gravity?: number;
}
