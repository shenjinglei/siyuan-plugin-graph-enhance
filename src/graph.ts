import { i18n, plugin } from "./utils";

import { openTab, showMessage } from "siyuan";
import { getSetting } from "./settings";
import { CanvasRenderer } from "echarts/renderers";
import * as echarts from "echarts/core";
import {
    GraphChart,
    GraphSeriesOption,
    SunburstChart,
    SunburstSeriesOption
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";

echarts.use([
    GraphChart,
    SunburstChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<
    SunburstSeriesOption | GraphSeriesOption
>;

interface Graph {
    options: {
        directed: boolean,
        multigraph: boolean,
        compound: boolean
    };
    nodes: {
        v: string,
        value: any
    }[];
    edges: {
        v: string,
        w: string,
        value: any
    }[];
}

const dagre = require("dagre");
const graphlib = dagre.graphlib;

class EnhancedGraph {
    myChart: echarts.ECharts;
    rawGraph: {
        setDefaultEdgeLabel: (arg0: () => { label: string; }) => void;
        setNode: (arg0: string, arg1: { label: string; width: number; height: number; }) => any;
        setEdge: (arg0: string, arg1: string) => any; hasNode: (arg0: string) => any;
        outEdges: (arg0: string) => any[];
        inEdges: (arg0: string) => { v: string, w: string }[];
        sources: () => string[];
        node: (arg0: string) => { (): any; new(): any; label: any; };
        sinks: () => string[];
        nodes: () => string[];
        removeNode: (arg0: string) => void;
    };
    processedGraph: any;
    sunburstGraphData: any;
    sourceNodeId: string;
    searchMethod = "ancestor";


    public resize(param: { width: number, height: number }) {
        this.myChart.resize(param);
    }

    public initRawGraph(nodes: { id: string; label: string; }[], edges: { from: string; to: string; }[]) {
        this.rawGraph = new graphlib.Graph();
        this.rawGraph.setDefaultEdgeLabel(() => { return { label: "default label" }; });
        nodes.map((x: { id: string; label: string; }) => this.rawGraph.setNode(x.id, { label: x.label, width: 200, height: 30 }));
        edges.map((x: { from: string; to: string; }) => this.rawGraph.setEdge(x.from, x.to));

        if (getSetting("dailynoteExcluded") === "true") {
            this.rawGraph.nodes()
                .filter(x => /^\d{4}-\d{2}-\d{2}$/.test(this.rawGraph.node(x).label))
                .map(x => this.rawGraph.removeNode(x));
        }
    }

    public sunbrushDisplay() {
        this.processGraph();

        this.myChart.dispose();
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));

        const option: ECOption = {
            series: {
                type: "sunburst",

                nodeClick: "link",
                data: this.sunburstGraphData,
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
                        r: "35%",
                        itemStyle: {
                            borderWidth: 2,
                        },
                        label: {
                            align: "right",
                            minAngle: 7,
                        },
                    },
                    {
                        r0: "35%",
                        r: "70%",
                        label: {
                            align: "center",
                            minAngle: 5,
                        },
                    },
                    {
                        r0: "70%",
                        r: "72%",
                        label: {
                            position: "outside",
                            padding: 3,
                            silent: false,
                            minAngle: 3,
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
            openTab({ app: plugin.app, doc: { id: params.data.id, action: ["cb-get-focus"] } });
        });
    }



    public processGraph() {
        switch (this.searchMethod) {
            case "ancestor":
                this.getAncestorGraph();
                break;
            case "brother":
                this.getBrotherGraph();
                break;
            case "global":
                this.getGlobalGraph();
                break;
            case "source":
                this.getSourceGraph();
                break;
            case "sink":
                this.getSinkGraph();
                break;
            default:
                this.getAncestorGraph();
                break;
        }
    }

    private initProcessedGraph() {
        this.processedGraph = new graphlib.Graph();
        this.processedGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        this.processedGraph.setDefaultEdgeLabel(() => { return { label: "default label" }; });
    }

    public getAncestorGraph() {
        this.initProcessedGraph();

        const q = [];
        q.push(this.sourceNodeId);
        while (q.length > 0) {
            const cur = q.shift();
            if (this.processedGraph.hasNode(cur) && this.processedGraph.node(cur)) continue;
            this.insertToGraph(cur);
            const outEdges = this.rawGraph.outEdges(cur);
            outEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                q.push(x.w);
            });
        }
        const sourceInEdges = this.rawGraph.inEdges(this.sourceNodeId);
        sourceInEdges.map((x: any) => {
            this.processedGraph.setEdge(x.v, x.w);
            q.push(x.v);
        });
        while (q.length > 0) {
            const cur = q.shift();
            if (cur != this.sourceNodeId && this.processedGraph.hasNode(cur) && this.processedGraph.node(cur)) continue;
            this.insertToGraph(cur);
            const inEdges = this.rawGraph.inEdges(cur);
            inEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                q.push(x.v);
            });
        }
    }

    public getBrotherGraph() {
        this.initProcessedGraph();

        const q: string[] = [];
        this.insertToGraph(this.sourceNodeId);
        const sourceOutEdges = this.rawGraph.outEdges(this.sourceNodeId);
        sourceOutEdges.map((x: any) => {
            this.processedGraph.setEdge(x.v, x.w);
            q.push(x.w);
        });
        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            const inEdges = this.rawGraph.inEdges(cur);
            inEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                this.insertToGraph(x.v);
            });
        }
        const sourceInEdges = this.rawGraph.inEdges(this.sourceNodeId);
        sourceInEdges.map((x: any) => {
            this.processedGraph.setEdge(x.v, x.w);
            q.push(x.v);
        });
        while (q.length > 0) {
            const cur = q.shift();
            this.insertToGraph(cur);
            const outEdges = this.rawGraph.outEdges(cur);
            outEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                this.insertToGraph(x.w);
            });
        }
    }

    public getGlobalGraph() {
        this.initProcessedGraph();
        const nodesMaximum = Number(getSetting("nodesMaximum"));
        if (isNaN(nodesMaximum)) {
            showMessage(
                i18n.nodesMaximumParseErrorMsg,
                3000,
                "info"
            );
            return;
        }

        let count = 0;
        const q = [];
        q.push(this.sourceNodeId);
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift();
            if (this.processedGraph.hasNode(cur) && this.processedGraph.node(cur)) continue;
            this.insertToGraph(cur);
            const outEdges = this.rawGraph.outEdges(cur);
            outEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                q.push(x.w);
            });
            const inEdges = this.rawGraph.inEdges(cur);
            inEdges.map((x: any) => {
                this.processedGraph.setEdge(x.v, x.w);
                q.push(x.v);
            });
            count++;
        }

        while (q.length > 0) {
            const cur = q.shift();
            if (this.processedGraph.hasNode(cur) && this.processedGraph.node(cur)) continue;
            this.processedGraph.removeNode(cur);
        }
    }

    Threshold: number;

    generteLeaf(cur: string, childrenNum: number) {
        if (childrenNum >= this.Threshold) {
            return {
                id: cur,
                name: this.rawGraph.node(cur).label,
                value: 1,
            };
        } else {
            return {
                id: cur,
                name: this.rawGraph.node(cur).label,
                value: 0,
                amount: childrenNum,
            };
        }
    }

    getNodeData(cur: string, level: number): { id: string, name: string, children?: any[], value?: number, amount?: number } {
        if (level === 3) {
            return this.generteLeaf(cur, this.getNodes(cur).length);
        }

        const children = this.getNodes(cur).map((x: string) => this.getNodeData(x, level + 1));
        if (children.filter((x) => x.value === 0).length === children.length) {
            const temp = this.generteLeaf(cur, children.reduce((p, c) => p + c.amount, 0));
            return temp;
        }

        return {
            id: cur,
            name: this.rawGraph.node(cur).label,
            children: children,
        };
    }

    getNodes(cur: string) {
        if (this.searchMethod === "source")
            return this.rawGraph.outEdges(cur).map(x => x.w);
        else
            return this.rawGraph.inEdges(cur).map(x => x.v);
    }

    getSinkGraph() {
        this.Threshold = Number(getSetting("sinkThreshold"));

        this.sunburstGraphData = this.rawGraph.sinks().map((x: any) => this.getNodeData(x, 1));
    }

    getSourceGraph() {
        this.Threshold = Number(getSetting("sourceThreshold"));

        this.sunburstGraphData = this.rawGraph.sources().map((x: any) => this.getNodeData(x, 1));
    }


    private insertToGraph = (node: string) => {
        if (!node) return;
        this.processedGraph.setNode(node, this.rawGraph.node(node));
    };

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
            showMessage(
                i18n.needRefreshMsg,
                3000,
                "info"
            );
            return;
        }
        this.processGraph();
        dagre.layout(this.processedGraph);

        const dagreLayout: Graph = dagre.graphlib.json.write(this.processedGraph);

        this.myChart.dispose();
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));
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
                    },
                    data: dagreLayout.nodes.filter(x => x.value).map(x => {
                        if (x.v === this.sourceNodeId) {
                            return {
                                id: x.v, name: x.value.label, x: x.value.x, y: x.value.y,
                                itemStyle: {
                                    color: "rgba(205, 112, 112, 1)",
                                },
                                label: {
                                    color: "#FFF",
                                    textBorderColor: "inherit",
                                    textBorderWidth: 2
                                }

                            };
                        }
                        return { id: x.v, name: x.value.label, value: x.v, x: x.value.x, y: x.value.y };
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
            openTab({ app: plugin.app, doc: { id: params.value, action: ["cb-get-focus"] } });

            if (getSetting("autoFollow") === "true") {
                // @ts-ignore
                enhancedGraph.sourceNodeId = params.value;
                enhancedGraph.Display();
            }
        });
    }

    public init() {
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));
    }
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();