import { getSetting } from "./settings";
import { aEChart, plugin, rawGraph } from "./utils";

import * as echarts from "echarts/core";
import type {
    ComposeOption,
} from "echarts/core";
import {
    SunburstSeriesOption,
} from "echarts/charts";
import { openTab } from "siyuan";

interface SunburstNode {
    id: string,
    name: string,
    children?: any[],
    value?: number,
    amount?: number,
    height: number
}

type ECOption = ComposeOption<SunburstSeriesOption>;

class SunburstGraph {
    Threshold: number;
    sourceNodes: string[];
    sinkNodes: string[];
    diffuseGraphType: "source" | "sink" | "tail" = "source";
    sourceGraphData: any = undefined;
    sinkGraphData: any = undefined;

    generteLeaf(cur: string, childrenNum: number) {
        if (childrenNum >= this.Threshold) {
            return {
                id: cur,
                name: rawGraph.node(cur).label,
                value: 1,
                height: 1,
            };
        } else {
            return {
                id: cur,
                name: rawGraph.node(cur).label,
                value: 0,
                amount: childrenNum,
                height: 0,
            };
        }
    }

    getNodes(cur: string): string[] {
        if (this.diffuseGraphType === "source")
            return (rawGraph.outEdges(cur) ?? []).map(x => x.w);
        else
            return (rawGraph.inEdges(cur) ?? []).map(x => x.v);
    }

    getNodeData(cur: string, level: number): SunburstNode {
        if (level === 3) {
            return this.generteLeaf(cur, this.getNodes(cur).length);
        }

        const children = this.getNodes(cur).map((x: string) => this.getNodeData(x, level + 1));

        if (children.filter((x) => x.value === 0).length === children.length) {
            return this.generteLeaf(cur, children.reduce((p, c) => p + (c.amount ?? 0), 0));
        }

        return {
            id: cur,
            name: rawGraph.node(cur).label,
            children: children,
            height: children.map(x => x.height).reduce((p, c) => p > c ? p : c, 0) + 1,
        };
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

    getSourceGraph() {
        this.Threshold = Number(getSetting("sourceThreshold"));

        if (this.sourceNodes.length === 0) {
            //@ts-ignore
            this.sourceNodes = rawGraph.sources();
        }

        const result = this.sourceNodes
            .filter(x => !/^\d{4}-\d{2}-\d{2}$/.test(rawGraph.node(x).label))
            .map((x: any) => this.getNodeData(x, 1));

        this.sourceGraphData = this.genSunburstData(result);
    }


    getSinkGraph() {
        this.Threshold = Number(getSetting("sinkThreshold"));

        if (this.sinkNodes.length === 0) {
            //@ts-ignore
            this.sinkNodes = rawGraph.sinks();
        }

        const result = this.sinkNodes
            .filter(x => !/^\d{4}-\d{2}-\d{2}$/.test(rawGraph.node(x).label))
            .map((x: any) => this.getNodeData(x, 1));

        this.sinkGraphData = this.genSunburstData(result);
    }


    processSunburst() {
        switch (this.diffuseGraphType) {
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


    draw() {
        console.log("sunburst draw");

        this.processSunburst();

        aEChart.clear();
        aEChart.off("click");

        const option: ECOption = {
            series: {
                type: "sunburst",

                nodeClick: "link",
                data: this.diffuseGraphType === "source" ? this.sourceGraphData : this.sinkGraphData,
                radius: [0, "95%"],
                sort: "desc",

                emphasis: {
                    focus: "descendant",
                },

                startAngle: 91,

                levels: [
                    {},
                    {
                        r0: "10%",
                        r: "33%",
                        itemStyle: {
                            borderWidth: 2,
                        },
                        label: {
                            align: "right",
                            minAngle: 6,
                        },
                    },
                    {
                        r0: "33%",
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

        option && aEChart.setOption(option);

        aEChart.on("click", function (params: echarts.ECElementEvent) {
            // @ts-ignore
            const objId: string = params.data.id;
            if (objId) {
                openTab({ app: plugin.app, doc: { id: objId, action: ["cb-get-focus"] } });
            }
        });
    }
}

export const sunburstGraph = new SunburstGraph();