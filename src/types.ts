export interface DagreOutput {
    options: {
        directed: boolean,
        multigraph: boolean,
        compound: boolean
    };
    nodes: {
        v: string,
        value: DagreNodeValue
    }[];
    edges: {
        v: string,
        w: string,
        value: any
    }[];
}

export interface DagreNodeValue {
    label: string,
    width: number,
    height: number,
    x?: number,
    y?: number,
    color?: "start" | "normal" | "from" | "to" | "separate" | "brother",
    separate?: boolean
    dailynote?: boolean
    state: number
    branch: number
}