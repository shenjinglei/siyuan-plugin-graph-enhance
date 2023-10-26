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

interface GraphJSON {
    options: {
        directed: boolean,
        multigraph: boolean,
        compound: boolean
    };
    nodes: {
        v: string,
        value: {
            label: string,
            width: number,
            height: number,
            x: number,
            y: number,
            color?: "start" | "normal" | "from" | "to"
        }
    }[];
    edges: {
        v: string,
        w: string,
        value: any
    }[];
}

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
    setNode: (v: string, label: any) => Graph;
    hasNode: (v: string) => boolean;
    setEdge: (v: string, w: string, label?: any) => Graph;
    outEdges: (v: string) => DagreEdge[];
    inEdges: (w: string) => DagreEdge[];
    sources: () => string[];
    sinks: () => string[];
    node: (v: string) => any;
    edge: (v: string, w: string) => any;
    nodes: () => string[];
    removeNode: (v: string) => void;
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

const Color = {
    start: "#aa0000",
    normal: "#003cb4",
    from: "#8c13aa",
    to: "#008600"
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

    segregation = {
        nodeReg: "^Phrase$",
        pos: -3
    };

    initRawGraph(nodes: EChartNode[], edges: EChartEdge[]) {
        this.rawGraph = new graphlib.Graph();

        nodes.forEach((x) => this.rawGraph.setNode(x.id, { label: x.label, width: 200, height: 30 }));
        edges.forEach((x) => this.rawGraph.setEdge(x.from, x.to));

        if (getSetting("dailynoteExcluded") === "true") {
            nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                .map(x => this.rawGraph.removeNode(x.id));
        }

        const disconnSetting = JSON.parse(getSetting("disconnection")) as any[][];

        for (const d of disconnSetting) {
            let i = d[1];
            let filteredEdges = nodes
                .filter(x => RegExp(d[0]).test(x.label))
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

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            if (cur.level >= 0) {
                this.searchDown(cur, q);
            }
            if (cur.level <= 0) {
                this.searchUp(cur, q);
            }
        }
    }

    public getBrotherGraph() {
        this.initProcessedGraph();

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            if (cur.level >= 0) {
                this.searchUp(cur, q);
            }
            if (cur.level <= 0) {
                this.searchDown(cur, q);
            }
        }
    }

    getCrossGraph() {
        this.initProcessedGraph();

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            if (cur.level >= -1) {
                this.searchDown(cur, q);
            }
            if (cur.level <= 1) {
                this.searchUp(cur, q);
            }
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
            this.insertToGraph(cur);
            this.searchDown(cur, q);
            this.searchUp(cur, q);
            count++;
        }
    }

    getNeighborGraph() {
        const neighborDepth = +getSetting("neighborDepth");
        this.initProcessedGraph();

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            if (cur.count < neighborDepth) {
                this.searchDown(cur, q);
                this.searchUp(cur, q);
            }
        }
    }

    searchDown(cur: QueueItem, q: QueueItem[]) {
        this.rawGraph.outEdges(cur.id)
            .filter(e => !this.processedGraph.hasNode(e.w))
            .filter(e => cur.count === 0 || this.rawGraph.edge(e.v, e.w)?.state !== "broken")
            .forEach(e => q.push({
                id: e.w,
                edge: e,
                level: cur.level + 1 === 0 ? NaN : cur.level + 1,
                count: cur.count + 1
            }));
    }

    searchUp(cur: QueueItem, q: QueueItem[]) {
        this.rawGraph.inEdges(cur.id)
            .filter(x => !this.processedGraph.hasNode(x.v))
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


    insertToGraph = (cur: QueueItem) => {
        if (cur.count === 0)
            this.processedGraph.setNode(cur.id, { ...this.rawGraph.node(cur.id), color: "start" });
        else
            this.processedGraph.setNode(cur.id, this.rawGraph.node(cur.id));
        if (cur.edge)
            this.processedGraph.setEdge(cur.edge.v, cur.edge.w);
    };

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

                if (getSetting("autoFollow") === "true") {
                    enhancedGraph.sourceNodeId = objId;
                    enhancedGraph.Display();
                }
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
        console.log("1");
        console.log(dagre.graphlib.json.write(this.processedGraph));
        dagre.layout(this.processedGraph);
        console.log("2");
        console.log(dagre.graphlib.json.write(this.processedGraph));
        const dagreLayout: GraphJSON = dagre.graphlib.json.write(this.processedGraph);

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
                                textBorderColor: "#FFF",
                                textBorderWidth: 2,
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

            if (getSetting("autoFollow") === "true") {
                // @ts-ignore
                enhancedGraph.sourceNodeId = params.data.id;
                enhancedGraph.Display();
            }
        });
    }

    public init() {
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));
    }
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();