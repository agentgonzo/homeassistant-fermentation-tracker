export const KNOWN_FERMENTATION_DOMAINS = new Set([
  "ispindel",
  "tilt_ble",
  "plaato",
  "brewfather",
  "grainfather",
  "brewpi",
  "fermentrack",
  "inkbird",
  "rapt_pill",
]);

export const GRAVITY_UNITS = new Set([
  "SG",
  "°P",
  "°Brix",
  "Brix",
  "Plato",
  "P",
  "sg",
]);

export const GRAVITY_ENTITY_KEYWORDS = [
  "gravity",
  "wort",
  "specific_gravity",
  "brix",
  "plato",
];

export const TEMPERATURE_ENTITY_KEYWORDS = [
  "temperature",
  "temp",
  "wort_temperature",
];

export const CARD_TAG_NAME = "fermentation-tracker-card" as const;
export const CARD_NAME = "Fermentation Tracker" as const;
