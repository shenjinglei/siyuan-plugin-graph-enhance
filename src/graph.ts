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

let lastNodeId: string;
let sourceNodeId: string;
export function setSourceNode(_id: string) {
    if (!_id || sourceNodeId === _id) return false;
    lastNodeId = sourceNodeId;
    sourceNodeId = _id;
    return true;
}

export function sourceNode() {
    return sourceNodeId;
}

let graphType = "ancestor";
export function setGraphType(_type: string) {
    graphType = _type;
}

export function title() {
    //console.log("label", rawGraph.node(sourceNodeId)?.label);
    if (graphType === "path")
        return rawGraph.node(lastNodeId)?.label + " → " + rawGraph.node(sourceNodeId)?.label;
    return rawGraph.node(sourceNodeId)?.label;
}

export function Display() {
    if (!sourceNodeId) {
        showMessage(i18n.needStartPointMsg, 3000, "info");
        return;
    }

    if (!rawGraph.hasNode(sourceNodeId)) {
        // showMessage(i18n.needRefreshMsg, 3000, "info");
        return;
    }

    createGraph(graphType).exec();

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

export function initRawGraph(nodes: SiyuanNode[], edges: SiyuanEdge[]) {
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

let processedGraph: dagre.graphlib.Graph<DagreNodeValue>;
let branchFlag = 1;

function createProcessedGraph() {
    return new dagre.graphlib.Graph<DagreNodeValue>().setDefaultEdgeLabel(() => { return {}; });
}

function initQueue() {
    const q: QueueItem[] = [];
    return q;
}

class Graph {
    constructor() {
        processedGraph = createProcessedGraph();
        branchFlag = 1;
    }

    exec() {
        throw "oops";
    }
}

class AncestorGraph extends Graph {
    exec() {
        const q = initQueue();
        q.push({ id: sourceNodeId, level: 0, count: 0 });

        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, processedGraph);
            insertEdge2(cur, rawGraph, processedGraph);
            if (cur.level >= 0) {
                searchDown2(cur, q, rawGraph, processedGraph);
            }
            if (cur.level <= 0) {
                searchUp2(cur, q, rawGraph, processedGraph);
            }
            count++;
        }
    }
}

class BrotherGraph extends Graph {
    exec() {
        const q = initQueue();
        q.push({ id: sourceNodeId, level: 0, count: 0 });
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, processedGraph);
            insertEdge2(cur, rawGraph, processedGraph);
            if (cur.level >= 0) {
                searchUp2(cur, q, rawGraph, processedGraph);
            }
            if (cur.level <= 0) {
                searchDown2(cur, q, rawGraph, processedGraph);
            }
            count++;
        }
    }
}

class CrossGraph extends Graph {
    exec() {
        const q = initQueue();
        q.push({ id: sourceNodeId, level: 0, count: 0 });
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, processedGraph);
            insertEdge2(cur, rawGraph, processedGraph);
            if (cur.level >= -1) {
                searchDown2(cur, q, rawGraph, processedGraph);
            }
            if (cur.level <= 1) {
                searchUp2(cur, q, rawGraph, processedGraph);
            }
            count++;
        }
    }
}

class GlobalGraph extends Graph {
    exec() {
        const q = initQueue();
        q.push({ id: sourceNodeId, level: 0, count: 0 });
        const nodesMaximum = +getSetting("nodesMaximum");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, processedGraph);
            insertEdge2(cur, rawGraph, processedGraph);
            searchDown2(cur, q, rawGraph, processedGraph);
            searchUp2(cur, q, rawGraph, processedGraph);
            count++;
        }
    }
}

class NeighborGraph extends Graph {
    exec() {
        const q = initQueue();
        q.push({ id: sourceNodeId, level: 0, count: 0 });
        const nodesMaximum = +getSetting("nodesMaximum");
        const neighborDepth = +getSetting("neighborDepth");

        let count = 0;
        while (q.length > 0 && count < nodesMaximum) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, processedGraph);
            insertEdge2(cur, rawGraph, processedGraph);
            if (cur.count < neighborDepth) {
                searchDown2(cur, q, rawGraph, processedGraph);
                searchUp2(cur, q, rawGraph, processedGraph);
            }
            count++;
        }
    }
}

function insertNode2(cur: QueueItem, _rawGraph: dagre.graphlib.Graph<any>, _processedGraph: dagre.graphlib.Graph<any>) {
    if (_processedGraph.hasNode(cur.id)) return;

    const rawNodeValue = _rawGraph.node(cur.id);
    if (cur.count === 0)
        _processedGraph.setNode(cur.id, { ...rawNodeValue, state: 0, branch: 0, level: cur.level, color: "start" });
    else if (Number.isNaN(cur.level))
        _processedGraph.setNode(cur.id, { ...rawNodeValue, state: 0, branch: 0, level: cur.level, color: "brother" });
    else
        _processedGraph.setNode(cur.id, { ...rawNodeValue, state: 0, branch: 0, level: cur.level });

}

function insertEdge2(cur: QueueItem, _rawGraph: dagre.graphlib.Graph<any>, _processedGraph: dagre.graphlib.Graph<any>) {

    if (!cur.edge) return;

    if (cur.count === 1) {
        _processedGraph.node(cur.id).branch = branchFlag;
        _processedGraph.setEdge(cur.edge, { branch: branchFlag });
        branchFlag = branchFlag << 1;
    }
    else {
        if (cur.id === cur.edge.v) {
            _processedGraph.setEdge(cur.edge, { branch: _processedGraph.node(cur.edge.w).branch });
        } else {
            _processedGraph.setEdge(cur.edge, { branch: _processedGraph.node(cur.edge.v).branch });
        }
        _processedGraph.node(cur.id).branch = _processedGraph.node(cur.edge.v).branch | _processedGraph.node(cur.edge.w).branch;
    }
}

function searchUp2(cur: QueueItem, q: QueueItem[], _rawGraph: dagre.graphlib.Graph<any>, _processedGraph: dagre.graphlib.Graph<any>, penetrate = 0) {
    const curNodeValue = _processedGraph.node(cur.id);
    if (curNodeValue.state & 2) return; // search is already done

    if (!penetrate && curNodeValue?.separate && cur.id === cur.edge?.v) return; // can't penetrate

    if (curNodeValue?.dailynote && cur.count !== 0) return;

    curNodeValue.state = curNodeValue.state | 2;

    _rawGraph.inEdges(cur.id)
        ?.filter(e => _processedGraph.node(e.v)?.state !== 3)
        .filter(e => penetrate || cur.count === 0 || _rawGraph.edge(e.v, e.w)?.state !== "broken")
        .forEach(x => q.push({
            id: x.v,
            edge: x,
            level: cur.level - 1 === 0 ? NaN : (Number.isNaN(cur.level) ? -1 : cur.level - 1),
            count: cur.count + 1
        }));
}

function searchDown2(cur: QueueItem, q: QueueItem[], _rawGraph: dagre.graphlib.Graph<any>, _processedGraph: dagre.graphlib.Graph<any>, penetrate = 0) {
    const curNodeValue = _processedGraph.node(cur.id);

    if (curNodeValue.state & 1) return; // search is already done

    if (!penetrate && curNodeValue.separate && cur.id === cur.edge?.w) return; // can't penetrate

    if (curNodeValue.dailynote && cur.count !== 0) return;

    curNodeValue.state = curNodeValue.state | 1;

    _rawGraph.outEdges(cur.id)
        ?.filter(e => _processedGraph.node(e.w)?.state !== 3)
        .filter(e => penetrate || cur.count === 0 || _rawGraph.edge(e.v, e.w)?.state !== "broken")
        .forEach(e => q.push({
            id: e.w,
            edge: e,
            level: cur.level + 1 === 0 ? NaN : (Number.isNaN(cur.level) ? 1 : cur.level + 1),
            count: cur.count + 1
        }));


}

class PathGraph extends Graph {
    exec() {
        const q = initQueue();
        const middleGraph = new dagre.graphlib.Graph<DagreNodeValue>().setDefaultEdgeLabel(() => { return {}; });
        q.push({ id: sourceNodeId, level: 0, count: 0 });
        while (q.length > 0) {
            const cur = q.shift()!;
            insertNode2(cur, rawGraph, middleGraph);
            insertEdge2(cur, rawGraph, middleGraph);
            searchUp2(cur, q, rawGraph, middleGraph, 1);
        }
        //console.log("middleGraph", dagre.graphlib.json.write(middleGraph));
        //console.log("sourceNode", rawGraph.node(sourceNodeId));
        //console.log("lastNodeId", rawGraph.node(lastNodeId));
        q.push({ id: lastNodeId, level: 0, count: 0 });
        branchFlag = 1;
        while (q.length > 0) {
            const cur = q.shift()!;
            insertNode2(cur, middleGraph, processedGraph);
            insertEdge2(cur, middleGraph, processedGraph);
            searchDown2(cur, q, middleGraph, processedGraph, 1);
        }
        //console.log("processedGraph", dagre.graphlib.json.write(processedGraph));

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
        case "path":
            return new PathGraph();
        default:
            return new Graph();
    }
}