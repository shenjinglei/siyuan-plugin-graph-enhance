import { aEChart, i18n, plugin, rawGraph, setRawGraph } from "./utils";

import { openTab, showMessage } from "siyuan";
import { getSetting } from "./settings";
import { CanvasRenderer } from "echarts/renderers";
import * as echarts from "echarts/core";
import {
    GraphChart,
    GraphSeriesOption,
    SunburstChart,
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";

import * as dagre from "@dagrejs/dagre";
import { DagreNodeValue, DagreOutput } from "./types";

const ColorJs = require("colorjs.io/dist/color.legacy.cjs").default;

echarts.use([
    GraphChart,
    SunburstChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<GraphSeriesOption>;

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
    edge?: dagre.Edge,
    level: number,
    count: number,
    active?: number,
}

let Color = {
    start: "#aa0000",
    normal: "#003cb4",
    from: "#8c13aa",
    to: "#008600",
    separate: "#aaaa00",
    brother: "#ff00ff"
};

const primaryColours = ["Tomato", "GoldenRod", "LimeGreen", "DarkTurquoise", "RoyalBlue", "Violet", "Crimson"];

interface Palette {
    [key: string]: string;
}

class EnhancedGraph {
    processedGraph: dagre.graphlib.Graph<DagreNodeValue>;
    sourceNodeId: string;
    focusGraphType: "global" | "ancestor" | "brother" | "cross" | "neighbor" = "ancestor";
    diffuseGraphType: "source" | "sink" | "tail" = "source";
    palette: Palette = {};

    getColor(flag: number): string {
        const result = this.palette[flag];
        if (result !== undefined)
            return result;

        const colors: string[] = [];
        let mask = 1;
        for (let index = 0; index < 32; index++) {
            if ((flag & mask) !== 0) {
                colors.push(primaryColours[index % primaryColours.length]);
            }
            mask <<= 1;
        }

        let newColor = new ColorJs(colors[0] ?? "Violet");
        for (let i = 1; i < colors.length; i++) {
            newColor = newColor.mix(colors[i], 1 / (i + 1), { space: "srgb" });
        }

        this.palette[flag] = newColor.toString({ format: "hex" });

        return this.palette[flag];
    }

    resize(param: { width: number, height: number }) {
        aEChart.resize(param);
    }

    initRawGraph(nodes: EChartNode[], edges: EChartEdge[]) {
        setRawGraph(new dagre.graphlib.Graph());

        nodes.forEach((x) => rawGraph.setNode(x.id, { label: x.label, color: "normal", width: 200, height: 30, state: 0, branch: 0 }));
        edges.forEach((x) => rawGraph.setEdge(x.from, x.to));


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
                        filteredNodes = filteredNodes.flatMap(x => rawGraph.outEdges(x) ?? []).map(x => x.w);
                        i--;
                    }
                } else {
                    while (i < 0) {
                        filteredNodes = filteredNodes.flatMap(x => rawGraph.inEdges(x) ?? []).map(x => x.v);
                        i++;
                    }
                }

                filteredNodes.forEach(s => {
                    rawGraph.setNode(s, { ...rawGraph.node(s), separate: true, color: "separate" });
                });

            } else {
                let filteredEdges = nodes
                    .filter(x => RegExp(d.nodeReg).test(x.label))
                    .flatMap(x => i > 0 ? rawGraph.outEdges(x.id) ?? [] : rawGraph.inEdges(x.id) ?? []);

                if (i > 0) {
                    while (i > 1) {
                        filteredEdges = filteredEdges.flatMap(x => rawGraph.outEdges(x.w) ?? []);
                        i--;
                    }
                } else {
                    while (i < -1) {
                        filteredEdges = filteredEdges.flatMap(x => rawGraph.inEdges(x.v) ?? []);
                        i++;
                    }
                }

                filteredEdges.forEach(e => {
                    rawGraph.setEdge(e.v, e.w, { state: "broken" });
                    rawGraph.setNode(e.v, { ...rawGraph.node(e.v), color: "from" });
                    rawGraph.setNode(e.w, { ...rawGraph.node(e.w), color: "to" });
                });
            }
        }

        if (getSetting("dailynoteExcluded") === "true") {
            nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                .forEach(x => rawGraph.removeNode(x.id));
        } else {
            nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                .forEach(x => rawGraph.node(x.id).dailynote = true);
        }


        const nodesExclusionSetting = getSetting("nodesExclusion").split("\n");
        nodesExclusionSetting.push("^ge-moc|ge-tag$");

        for (const item of nodesExclusionSetting) {
            if (/^\s*$/.test(item)) continue;

            nodes.filter(x => RegExp(item).test(x.label))
                .forEach(x => rawGraph.removeNode(x.id));
        }

        if (getThemeMode() === "dark") {
            Color = {
                start: "#ffa87c",
                normal: "#ffff7f",
                from: "#e6b4e8",
                to: "#6bff6b",
                separate: "#8ea3e8",
                brother: "#b33cb3"
            };
        } else {
            Color = {
                start: "#aa0000",
                normal: "#003cb4",
                from: "#aa5500",
                to: "#008600",
                separate: "#aaaa00",
                brother: "#b33cb3"
            };
        }

    }


    processGraph() {
        switch (this.focusGraphType) {
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
                this.getAncestorGraph();
        }
    }


    private initProcessedGraph() {
        this.processedGraph = new dagre.graphlib.Graph();
        //this.processedGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        this.processedGraph.setDefaultEdgeLabel(() => { return {}; });
        this.branchFlag = 1;

        const q: QueueItem[] = [];
        q.push({ id: this.sourceNodeId, level: 0, count: 0 });

        return q;
    }

    public getAncestorGraph() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            if (!this.processCurrentItem(cur)) {
                continue;
            }
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
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            if (!this.processCurrentItem(cur)) {
                continue;
            }
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
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            if (!this.processCurrentItem(cur)) {
                continue;
            }
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
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            if (!this.processCurrentItem(cur)) {
                continue;
            }
            this.searchDown(cur, q);
            this.searchUp(cur, q);
            count++;
        }
    }

    getNeighborGraph() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");
        const neighborDepth = +getSetting("neighborDepth");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            if (!this.processCurrentItem(cur)) {
                continue;
            }
            if (cur.count < neighborDepth) {
                this.searchDown(cur, q);
                this.searchUp(cur, q);
            } count++;
        }
    }

    branchFlag = 1;

    processCurrentItem = (cur: QueueItem): boolean => {
        const isBroken = cur.edge ? rawGraph.edge(cur.edge)?.state === "broken" : false;

        if (cur.count > 1 && isBroken)
            return false;
        this.insertNode(cur);
        this.insertEdge(cur);
        if (isBroken)
            return false;
        return true;
    };

    insertNode = (cur: QueueItem) => {
        if (this.processedGraph.hasNode(cur.id)) return;

        const rawNodeValue = rawGraph.node(cur.id);
        if (cur.count === 0)
            this.processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level, color: "start" });
        else if (Number.isNaN(cur.level))
            this.processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level, color: "brother" });
        else
            this.processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level });

    };

    insertEdge = (cur: QueueItem) => {
        const neighborDepth = +getSetting("neighborDepth");

        if (!cur.edge) return;
        const weight = neighborDepth - (cur.count < neighborDepth ? cur.count : neighborDepth) + 1;
        //this.processedGraph.setEdge(cur.edge, { weight });

        if (cur.count === 1) {
            this.processedGraph.node(cur.id).branch = this.branchFlag;
            this.processedGraph.setEdge(cur.edge, { weight, branch: this.branchFlag });
            this.branchFlag = this.branchFlag << 1;
        }
        else {
            if (cur.id === cur.edge.v) {
                this.processedGraph.setEdge(cur.edge, { weight, branch: this.processedGraph.node(cur.edge.w).branch });
            } else {
                this.processedGraph.setEdge(cur.edge, { weight, branch: this.processedGraph.node(cur.edge.v).branch });
            }
            this.processedGraph.node(cur.id).branch = this.processedGraph.node(cur.edge.v).branch | this.processedGraph.node(cur.edge.w).branch;
        }
    };

    searchDown(cur: QueueItem, q: QueueItem[]) {
        const curNodeValue = this.processedGraph.node(cur.id);

        if (curNodeValue.state & 1) return; // search is already done

        if (curNodeValue.separate && cur.id === cur.edge?.w) return; // can't penetrate

        if (curNodeValue.dailynote && cur.count !== 0) return;

        curNodeValue.state = curNodeValue.state | 1;

        rawGraph.outEdges(cur.id)
            ?.filter(e => this.processedGraph.node(e.w)?.state !== 3)
            .forEach(e => q.push({
                id: e.w,
                edge: e,
                level: cur.level + 1 === 0 ? NaN : (Number.isNaN(cur.level) ? 1 : cur.level + 1),
                count: cur.count + 1
            }));


    }

    searchUp(cur: QueueItem, q: QueueItem[]) {
        const curNodeValue = this.processedGraph.node(cur.id);
        if (curNodeValue.state & 2) return; // search is already done

        if (curNodeValue?.separate && cur.id === cur.edge?.v) return; // can't penetrate

        if (curNodeValue?.dailynote && cur.count !== 0) return;

        curNodeValue.state = curNodeValue.state | 2;

        rawGraph.inEdges(cur.id)
            ?.filter(e => this.processedGraph.node(e.v)?.state !== 3)
            .forEach(x => q.push({
                id: x.v,
                edge: x,
                level: cur.level - 1 === 0 ? NaN : (Number.isNaN(cur.level) ? -1 : cur.level - 1),
                count: cur.count + 1
            }));
    }


    public Display() {
        if (this.sourceNodeId === "0") {
            showMessage(
                i18n.needStartPointMsg,
                3000,
                "info"
            );
            return;
        }

        if (!rawGraph.hasNode(this.sourceNodeId)) {
            // showMessage(
            //     i18n.needRefreshMsg,
            //     3000,
            //     "info"
            // );
            return;
        }

        this.processGraph();

        const processedJson: DagreOutput = dagre.graphlib.json.write(this.processedGraph);

        processedJson.nodes.sort((x, y) => x.v.localeCompare(y.v));
        processedJson.edges.sort((x, y) => Math.min(x.v.localeCompare(y.v), x.w.localeCompare(y.w)));

        const layoutGraph = dagre.graphlib.json.read(JSON.parse(JSON.stringify(processedJson)));

        layoutGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        layoutGraph.setDefaultEdgeLabel(() => { return {}; });

        dagre.layout(layoutGraph);

        const dagreLayout: DagreOutput = dagre.graphlib.json.write(layoutGraph);

        aEChart.clear();
        aEChart.off("click");

        const option: ECOption = {
            tooltip: {},
            animation: false,
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
                                //color: this.getColor(x.value.branch)
                            },
                            label: {
                                color: "inherit",
                                fontFamily: "OPPOSans",
                                width: x.value.label.length > 16 ? 160 : undefined,
                                overflow: "break",
                            }
                        };
                    }),
                    links: dagreLayout.edges.map((x: any) => {
                        return {
                            source: x.v, target: x.w, value: x.value.branch,
                            label: { show: false, formatter: "{c}" },
                            lineStyle: { color: this.getColor(x.value.branch) }
                        };
                    }),
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

function getThemeMode() {
    return document.querySelector("html")?.getAttribute("data-theme-mode");
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();