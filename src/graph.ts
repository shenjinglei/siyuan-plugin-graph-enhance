import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
    GraphChart,
    GraphSeriesOption,
} from "echarts/charts";

echarts.use([
    GraphChart,
    CanvasRenderer
]);

import type {
    ComposeOption,
} from "echarts/core";

type ECOption = ComposeOption<
    | GraphSeriesOption
>;

const dagre = require("dagre");
const graphlib = dagre.graphlib;

class EnhancedGraph {
    myChart: echarts.ECharts;
    rawGraph: any;
    processedGraph: any;

    public resize(param: { width: number, height: number }) {
        this.myChart.resize(param);
    }

    public initRawGraph(nodes: { id: string; label: string; }[], edges: { from: string; to: string; }[]) {
        this.rawGraph = new graphlib.Graph();
        this.rawGraph.setDefaultEdgeLabel(() => { return { label: "default label" }; });
        nodes.map((x: { id: string; label: string; }) => this.rawGraph.setNode(x.id, { label: x.label, width: 200, height: 10 }));
        edges.map((x: { from: string; to: string; }) => this.rawGraph.setEdge(x.from, x.to));
        console.log(this.rawGraph);
    }

    public processGraph(sourceNodeId: string) {
        this.processedGraph = new graphlib.Graph();
        this.processedGraph.setGraph({ rankdir: "LR", ranker: "longest-path" });
        this.processedGraph.setDefaultEdgeLabel(() => { return { label: "default label" }; });

        const q = [];
        q.push(sourceNodeId);
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

        console.log(this.processedGraph);
    }

    private insertToGraph = (node: string) => {
        if (!node) return;
        this.processedGraph.setNode(node, this.rawGraph.node(node));
    };

    public Display() {
        dagre.layout(this.processedGraph);

        const dagreLayout = dagre.graphlib.json.write(this.processedGraph);

        const option: ECOption = {
            title: {
                text: "Les Miserables",
                subtext: "Default layout",
                top: "bottom",
                left: "right",
            },
            tooltip: {},
            animationDuration: 1500,
            animationEasingUpdate: "quinticInOut",
            series: [
                {
                    name: "Les Miserables",
                    type: "graph",
                    layout: "none",
                    edgeSymbol: ["none", "arrow"],
                    draggable: true,
                    roam: true,
                    label: {
                        show: true,
                    },
                    data: dagreLayout.nodes.map((x: any) => {
                        return { id: x.v, name: x.value.label, x: x.value.x, y: x.value.y };
                    }),
                    links: dagreLayout.edges.map((x: any) => {
                        return { source: x.v, target: x.w };
                    }),
                },
            ],
        };

        this.myChart.setOption(option);
    }

    public init() {
        this.myChart = echarts.init(document.getElementById("graph_enhance_container"));
    }
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();