import "./fermentation-card";

declare global {
  interface Window {
    customCards: Array<{
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

window.customCards ??= [];
window.customCards.push({
  type: "fermentation-tracker-card",
  name: "Fermentation Tracker",
  description: "Displays live data from iSpindel, Tilt Hydrometer and other fermentation devices",
  preview: true,
  documentationURL: "https://github.com/agentgonzo/homeassistant-fermentation-tracker",
});
