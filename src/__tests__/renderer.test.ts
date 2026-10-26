/**
 * Unit tests for hover preview in src/renderer.ts.
 * Mocks: echarts (captures event handlers), siyuan, utils (plugin), settings (getSetting).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Handler = (params: any) => void;
const handlers: Record<string, Handler> = {};
const fakeChart = {
    clear: vi.fn(),
    off: vi.fn((event: string) => {
        delete handlers[event];
    }),
    on: vi.fn((event: string, queryOrHandler: unknown, handler?: Handler) => {
        handlers[event] = (handler ?? queryOrHandler) as Handler;
    }),
    setOption: vi.fn(),
    resize: vi.fn(),
    getDom: () => ({ getBoundingClientRect: () => ({ left: 100, top: 50 }) }),
};

vi.mock("echarts/core", () => ({
    use: vi.fn(),
    init: vi.fn(() => fakeChart),
}));
vi.mock("echarts/renderers", () => ({ CanvasRenderer: {} }));
vi.mock("echarts/charts", () => ({ GraphChart: {} }));

interface FakePanel {
    element?: any;
    destroy: ReturnType<typeof vi.fn>;
    hovered: boolean;
    listeners: Record<string, () => void>;
}

let blockPanels: FakePanel[] = [];

function createFakePanel(oid: string): FakePanel {
    const attrs: Record<string, string> = { "data-oid": oid, "data-pin": "false" };
    const panel: FakePanel = {
        hovered: false,
        listeners: {},
        destroy: vi.fn(() => {
            blockPanels = blockPanels.filter(item => item !== panel);
            (window as any).siyuan.blockPanels = blockPanels;
            panel.element = undefined;
        }),
    };
    panel.element = {
        getAttribute: (name: string) => attrs[name] ?? null,
        setAttribute: (name: string, value: string) => {
            attrs[name] = value;
        },
        matches: (selector: string) => selector === ":hover" && panel.hovered,
        classList: { contains: () => false },
        style: {},
        addEventListener: (event: string, listener: () => void) => {
            panel.listeners[event] = listener;
        },
    };
    return panel;
}

const addFloatLayer = vi.fn((opts: { refDefs: { refID: string }[] }) => {
    blockPanels.push(createFakePanel(opts.refDefs[0].refID));
});
const openTab = vi.fn();
vi.mock("siyuan", () => ({ openTab: (opts: unknown) => openTab(opts) }));
vi.mock("../utils", () => ({
    plugin: { app: {}, addFloatLayer: (opts: any) => addFloatLayer(opts) },
    getThemeMode: () => "light",
}));

let popoverTriggerSetting = "hover";
let popoverDelaySetting = "620";
vi.mock("../settings", () => ({
    getSetting: vi.fn((key: string) => {
        if (key === "popoverTrigger") return popoverTriggerSetting;
        if (key === "popoverDelay") return popoverDelaySetting;
        if (key === "fontSize") return "12";
        return "";
    }),
}));

import { draw, initEChart, positionPanel } from "../renderer";
import { DEFAULT_POPOVER_DELAY_MS, HOVER_PREVIEW_HIDE_DELAY_MS } from "../constants";

const layout = {
    nodes: [
        { v: "doc1", value: { label: "Doc 1", x: 0, y: 0 } },
        { v: "doc2", value: { label: "Doc 2", x: 10, y: 10 } },
    ],
    edges: [],
} as any;

let keydownHandler: ((event: any) => void) | undefined;

function hoverParams(id = "doc1", keys: { ctrlKey?: boolean, metaKey?: boolean } = {}) {
    return { data: { id }, event: { event: { clientX: 10, clientY: 20, ...keys } } };
}

function openPreview(id = "doc1"): FakePanel {
    handlers.mouseover(hoverParams(id));
    vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
    return blockPanels[blockPanels.length - 1];
}

describe("renderer hover preview", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        popoverTriggerSetting = "hover";
        popoverDelaySetting = "620";
        blockPanels = [];
        vi.stubGlobal("document", {
            getElementById: () => ({}),
            addEventListener: (event: string, listener: (e: any) => void) => {
                if (event === "keydown") keydownHandler = listener;
            },
        });
        vi.stubGlobal("window", { siyuan: { blockPanels } });
        initEChart();
        draw(layout);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("shows the SiYuan float layer after the hover delay", () => {
        handlers.mouseover(hoverParams());
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS - 1);
        expect(addFloatLayer).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(addFloatLayer).toHaveBeenCalledWith({
            refDefs: [{ refID: "doc1" }],
            x: 10,
            y: 20,
            isBacklink: false,
        });
    });

    it("cancels the preview when the mouse leaves the node", () => {
        handlers.mouseover(hoverParams());
        handlers.mouseout({});
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(addFloatLayer).not.toHaveBeenCalled();
    });

    it("cancels the preview when the mouse leaves the chart", () => {
        handlers.mouseover(hoverParams());
        handlers.globalout({});
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(addFloatLayer).not.toHaveBeenCalled();
    });

    it("cancels the preview when the node is clicked", () => {
        handlers.mouseover(hoverParams());
        handlers.click(hoverParams());
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(openTab).toHaveBeenCalled();
        expect(addFloatLayer).not.toHaveBeenCalled();
    });

    it("cancels the preview when the graph is redrawn", () => {
        handlers.mouseover(hoverParams());
        draw(layout);
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(addFloatLayer).not.toHaveBeenCalled();
    });

    describe("trigger modes", () => {
        it("uses the configured hover delay", () => {
            popoverDelaySetting = "1200";
            handlers.mouseover(hoverParams());
            vi.advanceTimersByTime(1199);
            expect(addFloatLayer).not.toHaveBeenCalled();
            vi.advanceTimersByTime(1);
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("supports a zero hover delay", () => {
            popoverDelaySetting = "0";
            handlers.mouseover(hoverParams());
            vi.advanceTimersByTime(0);
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("falls back to the default delay for an invalid value", () => {
            popoverDelaySetting = "abc";
            handlers.mouseover(hoverParams());
            vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS - 1);
            expect(addFloatLayer).not.toHaveBeenCalled();
            vi.advanceTimersByTime(1);
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("shows immediately with Ctrl held in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams("doc1", { ctrlKey: true }));
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("shows immediately with Meta (⌘) held in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams("doc1", { metaKey: true }));
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("does nothing without a modifier key in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS * 10);
            expect(addFloatLayer).not.toHaveBeenCalled();
        });

        it("never shows a popover in none mode", () => {
            popoverTriggerSetting = "none";
            handlers.mouseover(hoverParams("doc1", { ctrlKey: true }));
            vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS * 10);
            expect(addFloatLayer).not.toHaveBeenCalled();
        });

        it("registers the keydown listener only once", () => {
            const before = keydownHandler;
            initEChart();
            expect(keydownHandler).toBe(before);
            expect(keydownHandler).toBeTypeOf("function");
        });

        it("shows immediately when Ctrl is pressed while hovering in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            expect(addFloatLayer).not.toHaveBeenCalled();
            keydownHandler!({ key: "Control" });
            expect(addFloatLayer).toHaveBeenCalledWith({
                refDefs: [{ refID: "doc1" }],
                x: 10,
                y: 20,
                isBacklink: false,
            });
        });

        it("shows immediately when Meta (⌘) is pressed while hovering in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            keydownHandler!({ key: "Meta" });
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("ignores Ctrl after the mouse leaves the node", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            handlers.mouseout({});
            keydownHandler!({ key: "Control" });
            expect(addFloatLayer).not.toHaveBeenCalled();
        });

        it("ignores Ctrl after the mouse leaves the chart", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            handlers.globalout({});
            keydownHandler!({ key: "Control" });
            expect(addFloatLayer).not.toHaveBeenCalled();
        });

        it("ignores other keys while hovering in ctrl mode", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            keydownHandler!({ key: "Shift" });
            expect(addFloatLayer).not.toHaveBeenCalled();
        });

        it("does not reopen the popover on repeated Ctrl keydown", () => {
            popoverTriggerSetting = "ctrl";
            handlers.mouseover(hoverParams());
            keydownHandler!({ key: "Control" });
            keydownHandler!({ key: "Control", repeat: true });
            keydownHandler!({ key: "Control" });
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
            expect(blockPanels).toHaveLength(1);
        });

        it("ignores Ctrl keydown in hover and none modes", () => {
            handlers.mouseover(hoverParams());
            keydownHandler!({ key: "Control" });
            expect(addFloatLayer).not.toHaveBeenCalled();

            handlers.mouseout({});
            popoverTriggerSetting = "none";
            handlers.mouseover(hoverParams());
            keydownHandler!({ key: "Control" });
            vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS * 10);
            expect(addFloatLayer).not.toHaveBeenCalled();
        });
    });

    describe("closing the preview", () => {
        it("closes after the mouse leaves the node to blank canvas", () => {
            const panel = openPreview();
            handlers.mouseout({});
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS - 1);
            expect(panel.destroy).not.toHaveBeenCalled();
            vi.advanceTimersByTime(1);
            expect(panel.destroy).toHaveBeenCalledTimes(1);
        });

        it("closes after the mouse leaves the chart", () => {
            const panel = openPreview();
            handlers.globalout({});
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS);
            expect(panel.destroy).toHaveBeenCalledTimes(1);
        });

        it("stays open while the mouse is in the popover and closes after leaving it", () => {
            const panel = openPreview();
            handlers.mouseout({});
            panel.listeners.mouseenter();
            panel.hovered = true;
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS * 2);
            expect(panel.destroy).not.toHaveBeenCalled();

            panel.hovered = false;
            panel.listeners.mouseleave();
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS);
            expect(panel.destroy).toHaveBeenCalledTimes(1);
        });

        it("stays open when a nested popover from it is hovered", () => {
            const panel = openPreview();
            const nested = createFakePanel("doc1");
            nested.hovered = true;
            blockPanels.push(nested);
            panel.listeners.mouseleave();
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS);
            expect(panel.destroy).not.toHaveBeenCalled();
        });

        it("stays open when the mouse returns to the same node", () => {
            const panel = openPreview();
            handlers.mouseout({});
            handlers.mouseover(hoverParams());
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS + DEFAULT_POPOVER_DELAY_MS);
            expect(panel.destroy).not.toHaveBeenCalled();
            expect(addFloatLayer).toHaveBeenCalledTimes(1);
        });

        it("replaces the previous popover when another node is hovered", () => {
            const first = openPreview("doc1");
            const second = openPreview("doc2");
            expect(first.destroy).toHaveBeenCalledTimes(1);
            expect(second.destroy).not.toHaveBeenCalled();
            expect(blockPanels).toEqual([second]);
        });

        it("never closes a pinned popover", () => {
            const panel = openPreview();
            panel.element.setAttribute("data-pin", "true");
            handlers.mouseout({});
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS);
            draw(layout);
            expect(panel.destroy).not.toHaveBeenCalled();
        });

        it("closes immediately when the node is clicked", () => {
            const panel = openPreview();
            handlers.click(hoverParams());
            expect(panel.destroy).toHaveBeenCalledTimes(1);
        });

        it("closes immediately when the graph is redrawn", () => {
            const panel = openPreview();
            draw(layout);
            expect(panel.destroy).toHaveBeenCalledTimes(1);
        });

        it("ignores a popover already closed by SiYuan", () => {
            const panel = openPreview();
            panel.destroy();
            panel.destroy.mockClear();
            handlers.mouseout({});
            vi.advanceTimersByTime(HOVER_PREVIEW_HIDE_DELAY_MS);
            expect(panel.destroy).not.toHaveBeenCalled();
        });
    });
});

describe("renderer popover positioning", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        popoverTriggerSetting = "hover";
        popoverDelaySetting = "620";
        blockPanels = [];
        vi.stubGlobal("document", {
            getElementById: (id: string) => (id === "toolbar" ? { clientHeight: 32 } : id === "sidebar" ? null : {}),
            querySelector: () => null,
            addEventListener: () => undefined,
        });
        vi.stubGlobal("window", { siyuan: { blockPanels }, innerHeight: 800, innerWidth: 1000 });
        vi.stubGlobal("getComputedStyle", () => ({ boxSizing: "border-box", minHeight: "0px" }));
        initEChart();
        draw(layout);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    /** Fake popover whose height is its content height clamped by style.maxHeight */
    function fakeElement(contentHeight: number, width = 300) {
        const style: Record<string, string> = { maxHeight: "200px", top: "0px", left: "0px" };
        return {
            style,
            getBoundingClientRect: () => {
                const max = style.maxHeight ? parseFloat(style.maxHeight) : Infinity;
                return { height: Math.min(contentHeight, max), width };
            },
        } as any;
    }

    const rect = { left: 100, top: 300, right: 140, bottom: 330 };

    it("opens below the node when the content fits below", () => {
        const el = fakeElement(200);
        positionPanel(el, rect);
        expect(el.style.top).toBe("334px");
        expect(el.style.left).toBe("100px");
        expect(el.style.maxHeight).toBe(`${800 - 330 - 12}px`);
    });

    it("keeps a node near the bottom anchored below when the content still fits", () => {
        const el = fakeElement(100);
        positionPanel(el, { left: 100, top: 600, right: 140, bottom: 630 });
        expect(el.style.top).toBe("634px");
    });

    it("opens above with constrained height when there is more room above", () => {
        const el = fakeElement(2000);
        positionPanel(el, { left: 100, top: 600, right: 140, bottom: 630 });
        const maxHeight = 600 - 32 - 8;
        expect(el.style.maxHeight).toBe(`${maxHeight}px`);
        expect(el.style.top).toBe(`${600 - maxHeight - 8}px`);
    });

    it("constrains tall content below a node near the top instead of covering it", () => {
        const el = fakeElement(2000);
        positionPanel(el, { left: 100, top: 60, right: 140, bottom: 90 });
        expect(el.style.top).toBe("94px");
        expect(el.style.maxHeight).toBe(`${800 - 90 - 12}px`);
    });

    it("clamps the popover horizontally into the window", () => {
        const el = fakeElement(100, 300);
        positionPanel(el, { left: 900, top: 300, right: 940, bottom: 330 });
        expect(el.style.left).toBe(`${1000 - 300 - 8}px`);
    });

    it("anchors the float layer to the node symbol and label rect", () => {
        const label = { getBoundingRect: () => ({ x: 0, y: 25, width: 60, height: 15 }) };
        const symbol = {
            getBoundingRect: () => ({ x: 20, y: 10, width: 10, height: 10 }),
            getTextContent: () => label,
        };
        handlers.mouseover({
            data: { id: "doc1" },
            event: { target: { __hostTarget: symbol }, event: { clientX: 1, clientY: 2 } },
        });
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(addFloatLayer).toHaveBeenCalledWith(expect.objectContaining({ x: 100, y: 50 + 40 }));
    });

    it("uses the current zoom / pan transform when computing the anchor", () => {
        // Scale 2 and translate (30, 40), updated after hovering started (e.g. zoomed during the delay)
        let transform = [1, 0, 0, 1, 0, 0];
        const symbol = {
            getBoundingRect: () => ({ x: -5, y: -5, width: 10, height: 10 }),
            getComputedTransform: () => transform,
        };
        handlers.mouseover({
            data: { id: "doc1" },
            event: { target: symbol, event: { clientX: 1, clientY: 2 } },
        });
        transform = [2, 0, 0, 2, 30, 40];
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        expect(addFloatLayer).toHaveBeenCalledWith(expect.objectContaining({ x: 100 + 20, y: 50 + 50 }));
    });

    it("dismisses the popover when the graph is zoomed / panned or a node is dragged", () => {
        handlers.mouseover(hoverParams());
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        const panel = blockPanels[0];
        handlers.graphroam({});
        expect(panel.destroy).toHaveBeenCalled();

        handlers.mouseover(hoverParams("doc2"));
        vi.advanceTimersByTime(DEFAULT_POPOVER_DELAY_MS);
        const second = blockPanels[0];
        handlers.mousedown({});
        expect(second.destroy).toHaveBeenCalled();
    });
});
