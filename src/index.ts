import "./fermentation-card";
import pkg from "../package.json";

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

console.info(
  `%cFERMENTATION-TRACKER-CARD%c ${pkg.version} `,
  "color:#fff;background:#c67c1e;font-weight:700;padding:2px 6px;border-radius:3px 0 0 3px;",
  "color:#c67c1e;font-weight:700;padding:2px 6px;border-radius:0 3px 3px 0;border:1px solid #c67c1e;"
);
