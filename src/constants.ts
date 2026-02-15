import type { GraphType } from "./types";

/** All supported graph display modes */
export const GRAPH_TYPES: readonly GraphType[] = [
    "ancestor",
    "brother",
    "cross",
    "global",
    "neighbor",
    "path",
] as const;

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
