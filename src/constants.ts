import type { GraphType } from "./types";

/** All supported graph display modes */
export const GRAPH_TYPES: readonly GraphType[] = [
    "ancestor",
    "brother",
    "cross",
    "global",
] as const;

/** Default delay before showing the note preview popover in "hover" trigger mode */
export const DEFAULT_POPOVER_DELAY_MS = 620;

/** Upper bound for the configurable popover delay */
export const MAX_POPOVER_DELAY_MS = 5000;

/** Delay before closing the note preview popover after the mouse leaves the node or popover */
export const HOVER_PREVIEW_HIDE_DELAY_MS = 300;

/** Request body for Siyuan graph API (getGraph) */
export const GRAPH_API_CONF = {
    conf: {
        dailyNote: true,
        minRefs: 0,
        type: {
            blockquote: false,
            code: false,
            heading: false,
            list: false,
            listItem: false,
            math: false,
            paragraph: false,
            super: false,
            table: false,
            tag: false,
        },
    },
    k: "",
} as const;
