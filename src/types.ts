/** Graph type identifier for display mode */
export type GraphType = "ancestor" | "brother" | "cross" | "global";

/** Node/edge shape from Siyuan API */
export interface SiyuanNode {
    id: string;
    label: string;
}

export interface SiyuanEdge {
    from: string;
    to: string;
}

/** Internal queue item for BFS-style graph traversal */
export interface QueueItem {
    id: string;
    edge?: { v: string; w: string };
    level: number;
    count: number;
}

/** Dagre graph serialization format */
export interface DagreOutput {
    options: {
        directed: boolean;
        multigraph: boolean;
        compound: boolean;
    };
    nodes: Array<{ v: string; value: DagreNodeValue }>;
    edges: Array<{ v: string; w: string; value: { branch?: number } }>;
}

export interface DagreNodeValue {
    label: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    color?: "start" | "normal" | "from" | "to" | "separate" | "brother";
    separate?: boolean;
    dailynote?: boolean;
    state: number;
    branch: number;
}

/** Plugin storage key and setting keys for type-safe access */
export type SettingKey =
    | "ranker"
    | "nodesMaximum"
    | "nodesExclusion"
    | "font"
    | "fontSize";

export type VerticalRankDir = "TB" | "BT";
export type HorizontalRankDir = "LR" | "RL";

/** Dagre `rankdir` layout direction */
export type GraphRankDir = VerticalRankDir | HorizontalRankDir;

export interface GraphPersistedViewState {
    mode: GraphType;
}

export interface GraphPersistedFiltersState {
    hideDailyNotes: boolean;
    autoFollow: boolean;
}

export interface GraphPersistedLayoutState {
    rankdir: GraphRankDir;
    /** Remembers the last vertical direction so switching axes and back restores it */
    lastVertical: VerticalRankDir;
    /** Remembers the last horizontal direction so switching axes and back restores it */
    lastHorizontal: HorizontalRankDir;
}

/** Persisted graph runtime state */
export interface GraphPersistedState {
    version: 1;
    view: GraphPersistedViewState;
    filters: GraphPersistedFiltersState;
    layout: GraphPersistedLayoutState;
}

export interface GraphPersistedStatePatch {
    version?: GraphPersistedState["version"];
    view?: Partial<GraphPersistedViewState>;
    filters?: Partial<GraphPersistedFiltersState>;
    layout?: Partial<GraphPersistedLayoutState>;
}