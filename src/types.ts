/** Graph type identifier for display mode */
export type GraphType = "ancestor" | "brother" | "cross" | "global" | "neighbor" | "path";

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
    | "rankdir"
    | "ranker"
    | "nodesMaximum"
    | "neighborDepth"
    | "autoFollow"
    | "separation"
    | "nodesExclusion";