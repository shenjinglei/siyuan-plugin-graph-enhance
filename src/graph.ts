import { i18n, plugin } from "./utils";

import { openTab, showMessage } from "siyuan";
import { getSetting } from "./settings";
import { CanvasRenderer } from "echarts/renderers";
import * as echarts from "echarts/core";
import {
    GraphChart,
    GraphSeriesOption,
    SunburstChart,
    SunburstSeriesOption,
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";

const dagre = require("dagre");
const graphlib = dagre.graphlib;

echarts.use([
    GraphChart,
    SunburstChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<
    SunburstSeriesOption | GraphSeriesOption
>;



interface SunburstNode {
    id: string,
    name: string,
    children?: any[],
    value?: number,
    amount?: number,
    height: number
}

interface Graph {
    setDefaultEdgeLabel(arg0: () => any): void;
    setGraph: (g: any) => void;
    setNode: (v: string, label: DagreNodeValue) => Graph;
    hasNode: (v: string) => boolean;
    setEdge: (v: string, w: string, label?: any) => Graph;
    outEdges: (v: string) => DagreEdge[];
    inEdges: (w: string) => DagreEdge[];
    sources: () => string[];
    sinks: () => string[];
    node: (v: string) => DagreNodeValue;
    edge: (v: string, w: string) => any;
    nodes: () => string[];
    removeNode: (v: string) => void;
}

interface DagreOutput {
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

interface DagreNodeValue {
    label: string,
    width: number,
    height: number,
    x?: number,
    y?: number,
    color?: "start" | "normal" | "from" | "to" | "separate",
    separate?: boolean
    dailynote?: boolean
    state?: number
}

interface DagreEdge {
    v: string,
    w: string,
}

interface EChartNode {
    id: string;
    label: string;
}

interface EChartEdge {
    from: string;
    to: string;
}

interface QueueItem {
    id: string,
    edge?: DagreEdge,
    level: number,
    count: number
}

let Color = {
    start: "#aa0000",
    normal: "#003cb4",
    from: "#8c13aa",
    to: "#008600",
    separate: "#aaaa00",
};

class EnhancedGraph {
    myChart: echarts.ECharts;
    rawGraph: Graph;
    processedGraph: Graph;
    sourceGraphData: any = undefined;
    sinkGraphData: any = undefined;
    sourceNodeId: string;
    searchMethod = "cross";
    sunburstMethod = "source";

    resize(param: { width: number, height: number }) {
        this.myChart.resize(param);
    }

    initRawGraph(nodes: EChartNode[], edges: EChartEdge[]) {
        this.rawGraph = new graphlib.Graph();

        nodes.forEach((x) => this.rawGraph.setNode(x.id, { label: x.label, width: 200, height: 30 }));
        edges.forEach((x) => this.rawGraph.setEdge(x.from, x.to));

        if (getSetting("dailynoteExcluded") === "true") {
            nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                .forEach(x => this.rawGraph.removeNode(x.id));
        } else {
            nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                .forEach(x => this.rawGraph.node(x.id).dailynote = true);
        }

        const separationSetting = getSetting("separation").split("\n").map(x => {
            const index = x.lastIndexOf(",");
            return {
                nodeReg: x.slice(0, index),
                pos: Number(x.slice(index + 1))
            };
        });

        for (const d of separationSetting) {
            if (/^\s*$/.test(d.nodeReg) || Number.isNaN(d.pos)) continue;

            let i = d.pos;
            if (Number.isInteger(i)) {
                let filteredNodes = nodes.filter(x => RegExp(d.nodeReg).test(x.label)).map(x => x.id);

                if (i > 0) {
                    while (i > 0) {
                        filteredNodes = filteredNodes.flatMap(x => this.rawGraph.outEdges(x)).map(x => x.w);
                        i--;
                    }
                } else {
                    while (i < 0) {
                        filteredNodes = filteredNodes.flatMap(x => this.rawGraph.inEdges(x).map(x => x.v));
                        i++;
                    }
                }

                filteredNodes.forEach(s => {
                    this.rawGraph.setNode(s, { ...this.rawGraph.node(s), separate: true, color: "separate" });
                });

            } else {
                let filteredEdges = nodes
                    .filter(x => RegExp(d.nodeReg).test(x.label))
                    .flatMap(x => i > 0 ? this.rawGraph.outEdges(x.id) : this.rawGraph.inEdges(x.id));

                if (i > 0) {
                    while (i > 1) {
                        filteredEdges = filteredEdges.flatMap(x => this.rawGraph.outEdges(x.w));
                        i--;
                    }
                } else {
                    while (i < -1) {
                        filteredEdges = filteredEdges.flatMap(x => this.rawGraph.inEdges(x.v));
                        i++;
                    }
                }

                filteredEdges.forEach(e => {
                    this.rawGraph.setEdge(e.v, e.w, { state: "broken" });
                    this.rawGraph.setNode(e.v, { ...this.rawGraph.node(e.v), color: "from" });
                    this.rawGraph.setNode(e.w, { ...this.rawGraph.node(e.w), color: "to" });
                });
            }
        }

        if (getThemeMode() === "dark") {
            Color = {
                start: "#ffa87c",
                normal: "#ffff7f",
                from: "#e6b4e8",
                to: "#6bff6b",
                separate: "#8ea3e8",
            };
        } else {
            Color = {
                start: "#aa0000",
                normal: "#003cb4",
                from: "#8c13aa",
                to: "#008600",
                separate: "#aaaa00",
            };
        }

        this.sourceGraphData = undefined;
        this.sinkGraphData = undefined;
    }

    processSunburst() {
        switch (this.sunburstMethod) {
            case "source":
                if (!this.sourceGraphData)
                    this.getSourceGraph();
                break;
            case "sink":
                if (!this.sinkGraphData)
                    this.getSinkGraph();
                break;
        }
    }

    public processGraph() {
        switch (this.searchMethod) {
            case "ancestor":
                this.getAncestorGraph();
                break;
            case "brother":
                this.getBrotherGraph();
                break;
            case "cross":
                this.getCrossGraph();
                break;
            case "global":
                this.getGlobalGraph();
                break;
            case "neighbor":
                this.getNeighborGraph();
                break;
            default:
                this.getCrossGraph();
                break;
        }
    }

    private initProcessedGraph() {
        this.processedGraph = new graphlib.Graph();
        this.processedGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        this.processedGraph.setDefaultEdgeLabel(() => { return {}; });

    }

    public getAncestorGraph() {
        this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            this.insertNode(cur);
            this.insertEdge(cur.edge);
            if (cur.level >= 0) {
                this.searchDown(cur, q);
            }
            if (cur.level <= 0) {
                this.searchUp(cur, q);
            }
            count++;
        }
    }

    public getBrotherGraph() {
        this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            this.insertNode(cur);
            this.insertEdge(cur.edge);
            if (cur.level >= 0) {
                this.searchUp(cur, q);
            }
            if (cur.level <= 0) {
                this.searchDown(cur, q);
            }
            count++;
        }
    }

    getCrossGraph() {
        this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            this.insertNode(cur);
            this.insertEdge(cur.edge);
            if (cur.level >= -1) {
                this.searchDown(cur, q);
            }
            if (cur.level <= 1) {
                this.searchUp(cur, q);
            }
            count++;
        }
    }

    getGlobalGraph() {
        this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            this.insertNode(cur);
            this.insertEdge(cur.edge);
            this.searchDown(cur, q);
            this.searchUp(cur, q);
            count++;
        }
    }

    getNeighborGraph() {
        const neighborDepth = +getSetting("neighborDepth");
        const nodesMaximum = +getSetting("nodesMaximum");
        this.initProcessedGraph();

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            this.insertNode(cur);
            this.insertEdge(cur.edge);
            if (cur.count < neighborDepth) {
                this.searchDown(cur, q);
                this.searchUp(cur, q);
            }
            count++;
        }
    }

    insertNode = (cur: QueueItem) => {
        if (this.processedGraph.hasNode(cur.id)) return;

        const rawNodeValue = this.rawGraph.node(cur.id);
        if (cur.count === 0)
            this.processedGraph.setNode(cur.id, { ...rawNodeValue, color: "start" });
        else
            this.processedGraph.setNode(cur.id, { ...rawNodeValue });

    };

    insertEdge = (edge: DagreEdge) => {
        if (!edge) return;
        this.processedGraph.setEdge(edge.v, edge.w);
    };

    searchDown(cur: QueueItem, q: QueueItem[]) {
        const curNodeValue = this.processedGraph.node(cur.id);

        if (curNodeValue?.state & 1) return; // search is already done

        if (curNodeValue?.separate && cur.id === cur.edge?.w) return; // can't penetrate

        if (curNodeValue?.dailynote && cur.count !== 0) return;

        curNodeValue["state"] = curNodeValue?.state | 1;

        this.rawGraph.outEdges(cur.id)
            .filter(e => this.processedGraph.node(e.w)?.state !== 3)
            .filter(e => cur.count === 0 || this.rawGraph.edge(e.v, e.w)?.state !== "broken")
            .forEach(e => q.push({
                id: e.w,
                edge: e,
                level: cur.level + 1 === 0 ? NaN : cur.level + 1,
                count: cur.count + 1
            }));
    }

    searchUp(cur: QueueItem, q: QueueItem[]) {
        const curNodeValue = this.processedGraph.node(cur.id);

        if (curNodeValue?.state & 2) return; // search is already done

        if (curNodeValue?.separate && cur.id === cur.edge?.v) return; // can't penetrate

        if (curNodeValue?.dailynote && cur.count !== 0) return;

        curNodeValue["state"] = curNodeValue?.state | 2;

        this.rawGraph.inEdges(cur.id)
            .filter(e => this.processedGraph.node(e.v)?.state !== 3)
            .filter(e => cur.count === 0 || this.rawGraph.edge(e.v, e.w)?.state !== "broken")
            .forEach(x => q.push({
                id: x.v,
                edge: x,
                level: cur.level - 1 === 0 ? NaN : cur.level - 1,
                count: cur.count + 1
            }));
    }


    Threshold: number;

    generteLeaf(cur: string, childrenNum: number) {
        if (childrenNum >= this.Threshold) {
            return {
                id: cur,
                name: this.rawGraph.node(cur).label,
                value: 1,
                height: 1,
            };
        } else {
            return {
                id: cur,
                name: this.rawGraph.node(cur).label,
                value: 0,
                amount: childrenNum,
                height: 0,
            };
        }
    }

    getNodeData(cur: string, level: number): SunburstNode {
        if (level === 3) {
            return this.generteLeaf(cur, this.getNodes(cur).length);
        }

        const children = this.getNodes(cur).map((x: string) => this.getNodeData(x, level + 1));

        if (children.filter((x) => x.value === 0).length === children.length) {
            return this.generteLeaf(cur, children.reduce((p, c) => p + c.amount, 0));
        }

        return {
            id: cur,
            name: this.rawGraph.node(cur).label,
            children: children,
            height: children.map(x => x.height).reduce((p, c) => p > c ? p : c, 0) + 1,
        };
    }

    getNodes(cur: string) {
        if (this.sunburstMethod === "source")
            return this.rawGraph.outEdges(cur).map(x => x.w);
        else
            return this.rawGraph.inEdges(cur).map(x => x.v);
    }

    genSunburstData(param: SunburstNode[]) {
        return [...param.filter(x => x.height === 3), {
            name: "其他",
            children: [...param.filter(x => x.height === 2), {
                name: "其他",
                children: param.filter(x => x.height === 1)
            }]
        }];
    }

    getSinkGraph() {
        this.Threshold = Number(getSetting("sinkThreshold"));

        const result = this.rawGraph.sinks()
            .filter(x => !/^\d{4}-\d{2}-\d{2}$/.test(this.rawGraph.node(x).label))
            .map((x: any) => this.getNodeData(x, 1));

        this.sinkGraphData = this.genSunburstData(result);
    }

    getSourceGraph() {
        this.Threshold = Number(getSetting("sourceThreshold"));

        const result = this.rawGraph.sources()
            .filter(x => !/^\d{4}-\d{2}-\d{2}$/.test(this.rawGraph.node(x).label))
            .map((x: any) => this.getNodeData(x, 1));

        this.sourceGraphData = this.genSunburstData(result);
    }



    sunbrushDisplay() {
        this.processSunburst();

        this.myChart.clear();
        this.myChart.off("click");

        const option: ECOption = {
            series: {
                type: "sunburst",

                nodeClick: "link",
                data: this.sunburstMethod === "source" ? this.sourceGraphData : this.sinkGraphData,
                radius: [0, "95%"],
                sort: "desc",

                emphasis: {
                    focus: "descendant",
                },

                startAngle: 91,

                levels: [
                    {},
                    {
                        r0: "15%",
                        r: "40%",
                        itemStyle: {
                            borderWidth: 2,
                        },
                        label: {
                            align: "right",
                            minAngle: 6,
                        },
                    },
                    {
                        r0: "40%",
                        r: "70%",
                        label: {
                            align: "center",
                            minAngle: 4,
                        },
                    },
                    {
                        r0: "70%",
                        r: "72%",
                        label: {
                            position: "outside",
                            padding: 3,
                            silent: false,
                            minAngle: 2,
                        },
                        itemStyle: {
                            borderWidth: 3,
                        },
                    },
                ],
            },
        };

        option && this.myChart.setOption(option);

        this.myChart.on("click", function (params: echarts.ECElementEvent) {
            // @ts-ignore
            const objId: string = params.data.id;
            if (objId) {
                openTab({ app: plugin.app, doc: { id: objId, action: ["cb-get-focus"] } });
            }
        });
    }

    public Display() {
        if (!this.sourceNodeId || this.sourceNodeId == "") {
            showMessage(
                i18n.needStartPointMsg,
                3000,
                "info"
            );
            return;
        }

        if (!this.rawGraph.hasNode(this.sourceNodeId)) {
            // showMessage(
            //     i18n.needRefreshMsg,
            //     3000,
            //     "info"
            // );
            return;
        }

        this.processGraph();

        dagre.layout(this.processedGraph);

        const dagreLayout: DagreOutput = dagre.graphlib.json.write(this.processedGraph);

        this.myChart.clear();
        this.myChart.off("click");

        const option: ECOption = {
            tooltip: {},
            animationDuration: 1500,
            animationEasingUpdate: "quinticInOut",
            series: [
                {
                    name: "graph",
                    type: "graph",
                    layout: "none",
                    edgeSymbol: ["none", "arrow"],
                    draggable: true,
                    roam: true,
                    label: {
                        show: true,
                        position: "bottom",
                    },
                    data: dagreLayout.nodes.filter(x => x.value).map(x => {
                        return {
                            id: x.v,
                            name: x.value.label,
                            x: x.value.x,
                            y: x.value.y,
                            symbol: "circle",
                            symbolSize: 5,
                            itemStyle: {
                                color: Color[x.value.color ?? "normal"]
                            },
                            label: {
                                color: "inherit",
                            }
                        };
                    }),
                    links: dagreLayout.edges.map((x: any) => {
                        return { source: x.v, target: x.w };
                    }),
                },
            ],
        };

        this.myChart.setOption(option);
        this.myChart.on("click", { dataType: "node" }, function (params: echarts.ECElementEvent) {
            // @ts-ignore
            openTab({ app: plugin.app, doc: { id: params.data.id, action: ["cb-get-focus"] } });
        });
    }

    public init() {
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));


    }
}

function getThemeMode() {
    return document.querySelector("html")?.getAttribute("data-theme-mode");
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();