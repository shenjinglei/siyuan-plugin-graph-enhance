import { graphlib } from "@dagrejs/dagre";
import { aEChart, plugin, rawGraph } from "./utils";

import * as echarts from "echarts/core";
import type {
    ComposeOption,
} from "echarts/core";
import {
    GraphSeriesOption,
} from "echarts/charts";
import { getSetting } from "./settings";
import { openTab } from "siyuan";

type ECOption = ComposeOption<
    GraphSeriesOption
>;

class TailGraph {
    processTailGraph() {
        const tailGraph: string[][] = graphlib.alg.components(rawGraph);

        const tailThresholdSetting = getSetting("tailThreshold").split(",");

        const lowerBound = +tailThresholdSetting[0];
        const upperBound = +tailThresholdSetting[1];

        if (Number.isNaN(upperBound) || Number.isNaN(lowerBound)) {
            return [[]];
        }

        return tailGraph.filter(x => x.length >= lowerBound && x.length <= upperBound);
    }

    createEdges(group: string[]) {
        if (group.length === 1) return [];
        if (group.length === 2)
            return [[group[0], group[1]]];

        const edges = [];
        for (let i = 0; i < group.length; i++) {
            edges.push([group[i], group[(i + 1) % group.length]]);
        }
        return edges;
    }

    draw() {
        const result = this.processTailGraph();

        let edges: string[][] = [];
        result.forEach(g => {
            edges = edges.concat(this.createEdges(g));
        });

        const nodes = result.flatMap(x => x).map(x => {
            return {
                id: x,
                name: rawGraph.node(x).label,
                symbol: "circle",
                symbolSize: 5,
                itemStyle: {
                    color: "#003cb4"
                },
                label: {
                    color: "inherit"
                }
            };
        });

        aEChart.clear();
        aEChart.off("click");

        const option: ECOption = {
            tooltip: {},
            animationDuration: 1500,
            animationEasingUpdate: "quinticInOut",
            series: [
                {
                    name: "graph",
                    type: "graph",
                    layout: "force",
                    draggable: true,
                    roam: true,
                    label: {
                        show: true,
                        position: "bottom",
                    },
                    data: nodes,
                    links: edges.map(x => { return { source: x[0], target: x[1] }; }),
                },
            ],
        };

        aEChart.setOption(option);
        aEChart.on("click", { dataType: "node" }, function (params: echarts.ECElementEvent) {
            // @ts-ignore
            openTab({ app: plugin.app, doc: { id: params.data.id, action: ["cb-get-focus"] } });
        });
    }
}

export const tailGraph = new TailGraph();