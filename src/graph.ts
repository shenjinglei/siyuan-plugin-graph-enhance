import { i18n, rawGraph, setRawGraph } from "./utils";

import { showMessage } from "siyuan";
import { getSetting } from "./settings";

import * as dagre from "@dagrejs/dagre";
import { DagreNodeValue, DagreOutput } from "./types";
import { draw } from "./renderer";

interface SiyuanNode {
    id: string;
    label: string;
}

interface SiyuanEdge {
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



class EnhancedGraph {
    sourceNodeId: string;
    focusGraphType: "global" | "ancestor" | "brother" | "cross" | "neighbor" = "ancestor";

    initRawGraph(nodes: SiyuanNode[], edges: SiyuanEdge[]) {
        setRawGraph(new dagre.graphlib.Graph());

        nodes.forEach((x) => rawGraph.setNode(x.id, { label: x.label, color: "normal", width: 200, height: 30, state: 0, branch: 0 }));
        edges.forEach((x) => rawGraph.setEdge(x.from, x.to));

        cutEdgeInit();
        cutVertexInit();
        dailynoteNodeInit();
        ExclusionNodeInit();

        //console.log("rawGraph", dagre.graphlib.json.write(rawGraph));

        function ExclusionNodeInit() {
            const nodesExclusionSetting = getSetting("nodesExclusion").split("\n");
            nodesExclusionSetting.push("^ge-moc$|^ge-tag$");
            nodesExclusionSetting.push("^ge-cv-?\\d+$|^ge-ce-?\\d+$");

            for (const item of nodesExclusionSetting) {
                if (/^\s*$/.test(item)) continue;

                nodes.filter(x => RegExp(item).test(x.label))
                    .forEach(x => rawGraph.removeNode(x.id));
            }
        }

        function dailynoteNodeInit() {
            if (getSetting("dailynoteExcluded") === "true") {
                nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                    .forEach(x => rawGraph.removeNode(x.id));
            } else {
                nodes.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.label))
                    .forEach(x => rawGraph.node(x.id).dailynote = true);
            }
        }

        function cutEdgeInit() {
            nodes.filter(x => /^ge-ce-?\d+$/.test(x.label)).forEach(x => {
                let pos = Number(/^ge-ce(-?\d+)$/.exec(x.label)?.[1]);
                const filteredNodes = (rawGraph.inEdges(x.id) ?? []).map(x => x.v);

                if (pos === 0) return;
                let filteredEdges = filteredNodes.flatMap(x => pos > 0 ? rawGraph.outEdges(x) ?? [] : rawGraph.inEdges(x) ?? []);
                while (pos > 1) {
                    filteredEdges = filteredEdges.flatMap(x => rawGraph.outEdges(x.w) ?? []);
                    pos--;
                }
                while (pos < -1) {
                    filteredEdges = filteredEdges.flatMap(x => rawGraph.inEdges(x.v) ?? []);
                    pos++;
                }
                filteredEdges.forEach(e => {
                    rawGraph.setEdge(e.v, e.w, { state: "broken" });
                    rawGraph.setNode(e.v, { ...rawGraph.node(e.v), color: "from" });
                    rawGraph.setNode(e.w, { ...rawGraph.node(e.w), color: "to" });
                });
            });
        }

        function cutVertexInit() {
            nodes.filter(x => /^ge-cv-?\d+$/.test(x.label)).forEach(x => {
                let pos = Number(/^ge-cv(-?\d+)$/.exec(x.label)?.[1]);
                let filteredNodes = (rawGraph.inEdges(x.id) ?? []).map(x => x.v);

                while (pos > 0) {
                    filteredNodes = filteredNodes.flatMap(x => rawGraph.outEdges(x) ?? []).map(x => x.w);
                    pos--;
                }
                while (pos < 0) {
                    filteredNodes = filteredNodes.flatMap(x => rawGraph.inEdges(x) ?? []).map(x => x.v);
                    pos++;
                }

                filteredNodes.forEach(x => rawGraph.setNode(x, { ...rawGraph.node(x), separate: true, color: "separate" }));
            });
        }
    }

    public Display() {
        if (!this.sourceNodeId) {
            showMessage(i18n.needStartPointMsg, 3000, "info");
            return;
        }

        if (!rawGraph.hasNode(this.sourceNodeId)) {
            // showMessage(i18n.needRefreshMsg, 3000, "info");
            return;
        }

        createGraph(this.focusGraphType).exec();

        const processedJson: DagreOutput = dagre.graphlib.json.write(processedGraph);

        processedJson.nodes.sort((x, y) => x.v.localeCompare(y.v));
        processedJson.edges.sort((x, y) => Math.min(x.v.localeCompare(y.v), x.w.localeCompare(y.w)));

        const layoutGraph = dagre.graphlib.json.read(JSON.parse(JSON.stringify(processedJson)));

        layoutGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        layoutGraph.setDefaultEdgeLabel(() => { return {}; });

        dagre.layout(layoutGraph);

        const dagreLayout: DagreOutput = dagre.graphlib.json.write(layoutGraph);

        draw(dagreLayout);
    }
}

export const enhancedGraph: EnhancedGraph = new EnhancedGraph();


let processedGraph: dagre.graphlib.Graph<DagreNodeValue>;
let branchFlag = 1;

function insertNode(cur: QueueItem) {
    if (processedGraph.hasNode(cur.id)) return;

    const rawNodeValue = rawGraph.node(cur.id);
    if (cur.count === 0)
        processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level, color: "start" });
    else if (Number.isNaN(cur.level))
        processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level, color: "brother" });
    else
        processedGraph.setNode(cur.id, { ...rawNodeValue, level: cur.level });

}

function insertEdge(cur: QueueItem) {
    const neighborDepth = +getSetting("neighborDepth");

    if (!cur.edge) return;
    const weight = neighborDepth - (cur.count < neighborDepth ? cur.count : neighborDepth) + 1;
    //processedGraph.setEdge(cur.edge, { weight });

    if (cur.count === 1) {
        processedGraph.node(cur.id).branch = branchFlag;
        processedGraph.setEdge(cur.edge, { weight, branch: branchFlag });
        branchFlag = branchFlag << 1;
    }
    else {
        if (cur.id === cur.edge.v) {
            processedGraph.setEdge(cur.edge, { weight, branch: processedGraph.node(cur.edge.w).branch });
        } else {
            processedGraph.setEdge(cur.edge, { weight, branch: processedGraph.node(cur.edge.v).branch });
        }
        processedGraph.node(cur.id).branch = processedGraph.node(cur.edge.v).branch | processedGraph.node(cur.edge.w).branch;
    }
}

function searchDown(cur: QueueItem, q: QueueItem[]) {
    const curNodeValue = processedGraph.node(cur.id);

    if (curNodeValue.state & 1) return; // search is already done

    if (curNodeValue.separate && cur.id === cur.edge?.w) return; // can't penetrate

    if (curNodeValue.dailynote && cur.count !== 0) return;

    curNodeValue.state = curNodeValue.state | 1;

    rawGraph.outEdges(cur.id)
        ?.filter(e => processedGraph.node(e.w)?.state !== 3)
        .filter(e => cur.count === 0 || rawGraph.edge(e.v, e.w)?.state !== "broken")
        .forEach(e => q.push({
            id: e.w,
            edge: e,
            level: cur.level + 1 === 0 ? NaN : (Number.isNaN(cur.level) ? 1 : cur.level + 1),
            count: cur.count + 1
        }));


}

function searchUp(cur: QueueItem, q: QueueItem[]) {
    const curNodeValue = processedGraph.node(cur.id);
    if (curNodeValue.state & 2) return; // search is already done

    if (curNodeValue?.separate && cur.id === cur.edge?.v) return; // can't penetrate

    if (curNodeValue?.dailynote && cur.count !== 0) return;

    curNodeValue.state = curNodeValue.state | 2;

    rawGraph.inEdges(cur.id)
        ?.filter(e => processedGraph.node(e.v)?.state !== 3)
        .filter(e => cur.count === 0 || rawGraph.edge(e.v, e.w)?.state !== "broken")
        .forEach(x => q.push({
            id: x.v,
            edge: x,
            level: cur.level - 1 === 0 ? NaN : (Number.isNaN(cur.level) ? -1 : cur.level - 1),
            count: cur.count + 1
        }));
}

class Graph {


    initProcessedGraph() {
        processedGraph = new dagre.graphlib.Graph();
        //processedGraph.setGraph({ rankdir: getSetting("rankdir"), ranker: getSetting("ranker") });
        processedGraph.setDefaultEdgeLabel(() => { return {}; });
        branchFlag = 1;

        const q: QueueItem[] = [];
        q.push({ id: enhancedGraph.sourceNodeId, level: 0, count: 0 });

        return q;
    }

    exec() { throw "oops"; }

}

class AncestorGraph extends Graph {
    public exec() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode(cur);
            insertEdge(cur);
            if (cur.level >= 0) {
                searchDown(cur, q);
            }
            if (cur.level <= 0) {
                searchUp(cur, q);
            }
            count++;
        }
    }
}

class BrotherGraph extends Graph {
    public exec() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode(cur);
            insertEdge(cur);
            if (cur.level >= 0) {
                searchUp(cur, q);
            }
            if (cur.level <= 0) {
                searchDown(cur, q);
            }
            count++;
        }
    }
}

class CrossGraph extends Graph {
    exec() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode(cur);
            insertEdge(cur);
            if (cur.level >= -1) {
                searchDown(cur, q);
            }
            if (cur.level <= 1) {
                searchUp(cur, q);
            }
            count++;
        }
    }
}

class GlobalGraph extends Graph {
    exec() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode(cur);
            insertEdge(cur);
            searchDown(cur, q);
            searchUp(cur, q);
            count++;
        }
    }
}

class NeighborGraph extends Graph {
    exec() {
        const q = this.initProcessedGraph();
        const nodesMaximum = +getSetting("nodesMaximum");
        const neighborDepth = +getSetting("neighborDepth");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode(cur);
            insertEdge(cur);
            if (cur.count < neighborDepth) {
                searchDown(cur, q);
                searchUp(cur, q);
            } count++;
        }
    }
}

function createGraph(type: string) {
    switch (type) {
        case "ancestor":
            return new AncestorGraph();
        case "brother":
            return new BrotherGraph();
        case "cross":
            return new CrossGraph();
        case "global":
            return new GlobalGraph();
        case "neighbor":
            return new NeighborGraph();
        default:
            return new Graph();
    }
}