/**
 * Unit tests for src/graph.ts core logic.
 * Mocks: siyuan, utils (rawGraph/setRawGraph), settings (getSetting), renderer (draw).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as dagre from "@dagrejs/dagre";
import type { SiyuanNode, SiyuanEdge } from "../types";

// Mutable ref so graph module sees updated rawGraph after setRawGraph()
let rawGraphRef: dagre.graphlib.Graph<any> | null = null;

vi.mock("../utils", () => ({
    get rawGraph() {
        return rawGraphRef;
    },
    setRawGraph(g: dagre.graphlib.Graph<any>) {
        rawGraphRef = g;
    },
    i18n: { needStartPointMsg: "need start" },
}));

vi.mock("../settings", () => ({
    getSetting: vi.fn((key: string) => {
        const defaults: Record<string, string> = {
            rankdir: "LR",
            ranker: "network-simplex",
            nodesMaximum: "200",
            neighborDepth: "2",
            nodesExclusion: "",
        };
        return defaults[key] ?? "";
    }),
}));

vi.mock("../renderer", () => ({ draw: vi.fn() }));

// Import after mocks so graph.ts sees mocked modules
import {
    setSourceNode,
    sourceNode,
    setGraphType,
    title,
    initRawGraph,
    Display,
    setIsDailynote,
    isDailynote,
} from "../graph";
import { draw } from "../renderer";

describe("graph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        rawGraphRef = null;
        setSourceNode(""); // reset so sourceNodeId is cleared for tests that need fresh state
    });

    describe("setSourceNode / sourceNode", () => {
        it("returns false for empty id", () => {
            setSourceNode("a");
            expect(setSourceNode("")).toBe(false);
            expect(sourceNode()).toBe("a");
        });

        it("returns false when id equals current source", () => {
            setSourceNode("doc-1");
            expect(setSourceNode("doc-1")).toBe(false);
            expect(sourceNode()).toBe("doc-1");
        });

        it("returns true and updates source when id is new", () => {
            // Use distinct ids so test passes regardless of prior test state
            expect(setSourceNode("id-1")).toBe(true);
            expect(sourceNode()).toBe("id-1");
            expect(setSourceNode("id-2")).toBe(true);
            expect(sourceNode()).toBe("id-2");
        });
    });

    describe("setGraphType", () => {
        it("updates graph type used by title and Display", () => {
            setSourceNode("n1");
            rawGraphRef = new dagre.graphlib.Graph();
            rawGraphRef.setNode("n1", { label: "A", width: 200, height: 30, state: 0, branch: 0 });
            setGraphType("ancestor");
            expect(title()).toBe("A");
            setGraphType("global");
            expect(title()).toBe("A");
        });
    });

    describe("title", () => {
        it("returns node label when graphType is ancestor", () => {
            setSourceNode("n1");
            setGraphType("ancestor");
            rawGraphRef = new dagre.graphlib.Graph();
            rawGraphRef.setNode("n1", { label: "A", width: 200, height: 30, state: 0, branch: 0 });
            expect(title()).toBe("A");
        });

        it("returns path-style title when graphType is path (lastNodeId → sourceNodeId)", () => {
            setSourceNode("start");
            setSourceNode("end");
            setGraphType("path");
            rawGraphRef = new dagre.graphlib.Graph();
            rawGraphRef.setNode("start", { label: "Start", width: 200, height: 30, state: 0, branch: 0 });
            rawGraphRef.setNode("end", { label: "End", width: 200, height: 30, state: 0, branch: 0 });
            expect(title()).toBe("Start → End");
        });
    });

    describe("initRawGraph", () => {
        it("builds graph with nodes and edges", () => {
            const nodes: SiyuanNode[] = [
                { id: "a", label: "A" },
                { id: "b", label: "B" },
            ];
            const edges: SiyuanEdge[] = [{ from: "a", to: "b" }];
            initRawGraph(nodes, edges);
            expect(rawGraphRef).not.toBeNull();
            expect(rawGraphRef!.nodeCount()).toBe(2);
            expect(rawGraphRef!.edgeCount()).toBe(1);
            expect(rawGraphRef!.hasNode("a")).toBe(true);
            expect(rawGraphRef!.hasNode("b")).toBe(true);
            expect(rawGraphRef!.hasEdge("a", "b")).toBe(true);
        });

        it("marks dailynote nodes by label pattern YYYY-MM-DD", () => {
            const nodes: SiyuanNode[] = [
                { id: "d1", label: "2024-01-15" },
                { id: "n1", label: "Normal" },
            ];
            const edges: SiyuanEdge[] = [];
            initRawGraph(nodes, edges);
            expect(rawGraphRef!.node("d1").dailynote).toBe(true);
            expect((rawGraphRef!.node("n1") as any).dailynote).toBeUndefined();
        });

        it("excludes nodes matching nodesExclusion and built-in ge- patterns", () => {
            const nodes: SiyuanNode[] = [
                { id: "a", label: "A" },
                { id: "ge-moc", label: "ge-moc" },
                { id: "ge-tag", label: "ge-tag" },
            ];
            const edges: SiyuanEdge[] = [];
            initRawGraph(nodes, edges);
            expect(rawGraphRef!.hasNode("a")).toBe(true);
            expect(rawGraphRef!.hasNode("ge-moc")).toBe(false);
            expect(rawGraphRef!.hasNode("ge-tag")).toBe(false);
        });
    });

    describe("Display", () => {
        it("calls draw with dagre layout when source exists in rawGraph", () => {
            const nodes: SiyuanNode[] = [
                { id: "a", label: "A" },
                { id: "b", label: "B" },
            ];
            const edges: SiyuanEdge[] = [{ from: "a", to: "b" }];
            initRawGraph(nodes, edges);
            setSourceNode("a");
            setGraphType("global");
            Display();
            expect(draw).toHaveBeenCalledTimes(1);
            const payload = (draw as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(payload).toHaveProperty("nodes");
            expect(payload).toHaveProperty("edges");
            expect(payload.nodes.length).toBeGreaterThanOrEqual(1);
        });

        it("does not call draw when source node is not in rawGraph", () => {
            initRawGraph([{ id: "a", label: "A" }], []);
            setSourceNode("missing-id");
            Display();
            expect(draw).not.toHaveBeenCalled();
        });
    });

    describe("setIsDailynote / isDailynote", () => {
        it("toggles isDailynote", () => {
            const initial = isDailynote;
            setIsDailynote(!initial);
            expect(isDailynote).toBe(!initial);
            setIsDailynote(initial);
            expect(isDailynote).toBe(initial);
        });
    });
});
