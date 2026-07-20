// Shared devtools console formatting for the fermentation-tracker-card,
// matching the coloured name/tag "badge" convention used by other custom
// Lovelace cards (mini-graph-card, apexcharts-card, etc.) so our entries are
// easy to pick out alongside theirs.

const ACCENT = "#c67c1e";
const NAME_STYLE = `color:#fff;background:${ACCENT};font-weight:700;padding:2px 6px;border-radius:3px 0 0 3px;`;
const TAG_STYLE = `color:${ACCENT};font-weight:700;padding:2px 6px;border-radius:0 3px 3px 0;border:1px solid ${ACCENT};`;
const RESET_STYLE = "color:inherit;font-weight:normal;";

export type LogTag = "range" | "autoDetect" | "OG" | "delta24h" | "trend";

function badgeArgs(tag: LogTag, message: string): [string, string, string, string] {
  return [`%cFERMENTATION-TRACKER%c ${tag} %c ${message}`, NAME_STYLE, TAG_STYLE, RESET_STYLE];
}

export function logInfo(tag: LogTag, message: string): void {
  console.info(...badgeArgs(tag, message));
}

export function logWarn(tag: LogTag, message: string): void {
  console.warn(...badgeArgs(tag, message));
}

export function logError(tag: LogTag, message: string, err?: unknown): void {
  if (err !== undefined) {
    console.error(...badgeArgs(tag, message), err);
  } else {
    console.error(...badgeArgs(tag, message));
  }
}
