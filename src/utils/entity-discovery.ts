import type { HomeAssistant, EntityRegistryDisplayEntry } from "../types";
import { GRAVITY_UNITS, GRAVITY_ENTITY_KEYWORDS, TEMPERATURE_ENTITY_KEYWORDS } from "../const";

export function getDeviceEntities(
  hass: HomeAssistant,
  deviceId: string
): EntityRegistryDisplayEntry[] {
  return Object.values(hass.entities).filter(
    (e) =>
      e.device_id === deviceId &&
      !e.hidden &&
      e.entity_category === undefined
  );
}

export function deviceHasGravityEntity(
  hass: HomeAssistant,
  deviceId: string
): boolean {
  const entities = getDeviceEntities(hass, deviceId);
  return entities.some((regEntry) => {
    const stateObj = hass.states[regEntry.entity_id];
    if (!stateObj) return false;
    const uom = stateObj.attributes["unit_of_measurement"];
    if (typeof uom === "string" && GRAVITY_UNITS.has(uom)) return true;
    const id = regEntry.entity_id.toLowerCase();
    return GRAVITY_ENTITY_KEYWORDS.some((kw) => id.includes(kw));
  });
}

export function findGravityEntity(
  hass: HomeAssistant,
  deviceId: string
): string | undefined {
  const candidates = getDeviceEntities(hass, deviceId).filter((e) =>
    e.entity_id.startsWith("sensor.")
  );

  const byUom = candidates.find((e) => {
    const uom = hass.states[e.entity_id]?.attributes["unit_of_measurement"];
    return typeof uom === "string" && GRAVITY_UNITS.has(uom);
  });
  if (byUom) return byUom.entity_id;

  const byKeyword = candidates.find((e) =>
    GRAVITY_ENTITY_KEYWORDS.some((kw) => e.entity_id.toLowerCase().includes(kw))
  );
  return byKeyword?.entity_id;
}

export function findTemperatureEntity(
  hass: HomeAssistant,
  deviceId: string
): string | undefined {
  const candidates = getDeviceEntities(hass, deviceId).filter((e) =>
    e.entity_id.startsWith("sensor.")
  );

  const byDeviceClass = candidates.find(
    (e) => hass.states[e.entity_id]?.attributes["device_class"] === "temperature"
  );
  if (byDeviceClass) return byDeviceClass.entity_id;

  const byKeyword = candidates.find((e) =>
    TEMPERATURE_ENTITY_KEYWORDS.some((kw) => e.entity_id.toLowerCase().includes(kw))
  );
  return byKeyword?.entity_id;
}
