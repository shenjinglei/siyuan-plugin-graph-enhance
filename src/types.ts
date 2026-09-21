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

import { json as graphlibJson } from "@dagrejs/graphlib";
import type { NodeLabel } from "@dagrejs/dagre";

export interface GraphNodeValue extends NodeLabel {
    label: string;
    color?: "start" | "normal" | "from" | "to" | "separate" | "brother";
    separate?: boolean;
    dailynote?: boolean;
    state: number;
    branch: number;
}

export interface GraphEdgeValue {
    branch?: number;
}

type GraphlibJson = ReturnType<typeof graphlibJson.write>;

/** Serialized graph data with application-specific node and edge values. */
export interface GraphOutput extends Omit<GraphlibJson, "nodes" | "edges"> {
    nodes: Array<{ v: string; value: GraphNodeValue }>;
    edges: Array<{ v: string; w: string; value: GraphEdgeValue }>;
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