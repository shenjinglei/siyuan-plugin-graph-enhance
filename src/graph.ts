import { plugin } from "./utils";

import { openTab } from "siyuan";
import { pluginSetting } from "./settings";
import { CanvasRenderer } from "echarts/renderers";
import * as echarts from "echarts/core";
import {
    GraphChart,
    GraphSeriesOption,
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";

echarts.use([
    GraphChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<
    | GraphSeriesOption
>;

const dagre = require("dagre");
const graphlib = dagre.graphlib;

class EnhancedGraph {
    myChart: echarts.ECharts;
    rawGraph: any;
    processedGraph: any;
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
            default:
                this.getAncestorGraph();
                break;
        }
    }

    private initProcessedGraph() {
        this.processedGraph = new graphlib.Graph();
        this.processedGraph.setGraph({ rankdir: pluginSetting.getSetting("rankdir"), ranker: pluginSetting.getSetting("ranker") });
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
        const nodesMaximun = 200;
        let count = 0;
        const q = [];
        q.push(this.sourceNodeId);
        while (q.length > 0 && count < nodesMaximun) {
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
    }

    private insertToGraph = (node: string) => {
        if (!node) return;
        this.processedGraph.setNode(node, this.rawGraph.node(node));
    };

    public Display() {
        if (!this.sourceNodeId || this.sourceNodeId == "")
            return;
        if (!this.rawGraph.hasNode(this.sourceNodeId))
            return;
        this.processGraph();
        dagre.layout(this.processedGraph);

        const dagreLayout = dagre.graphlib.json.write(this.processedGraph);

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
                    data: dagreLayout.nodes.map((x: any) => {
                        if (x.v === this.sourceNodeId) {
                            return {
                                id: x.v, name: x.value.label, x: x.value.x, y: x.value.y, itemStyle: {
                                    color: "rgba(205, 112, 112, 1)"
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
        });
    }

    public init() {
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));
    }
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();