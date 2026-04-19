import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

const setIsHideDailynote = vi.fn();
const setGraphType = vi.fn();
const initEChart = vi.fn();

let savedIsHideDailynote = true;
let dockInit: (() => void) | undefined;

vi.mock("../graph", () => ({
    Display: vi.fn(),
    initRawGraph: vi.fn(),
    setGraphType,
    setIsHideDailynote,
    setSourceNode: vi.fn(),
}));

vi.mock("../utils", () => ({
    i18n: {
        pluginName: "Enhanced Graph",
        dockBtnHideDN: "Hide DailyNote",
        dockBtnShowDN: "Show DailyNote",
        dockBtnPath: "Path Graph",
        dockBtnGlobal: "Global Graph",
        dockBtnNeighbor: "Neighbor Graph",
        dockBtnCross: "Cross Graph",
        dockBtnAncestor: "Ancestor Graph",
        dockBtnBrother: "Brother Graph",
        dockBtnRefresh: "Refresh",
        dockBtnFullscreen: "Fullscreen",
        dockBtnExitFullscreen: "Exit Fullscreen",
    },
    plugin: {
        addDock: vi.fn(({ init }: { init: () => void }) => {
            dockInit = init;
        }),
        loadData: vi.fn(() => Promise.resolve()),
        eventBus: { on: vi.fn(), off: vi.fn() },
    },
    rawGraph: undefined,
    getGraphType: vi.fn(() => "ancestor"),
    saveGraphType: vi.fn(),
    getIsHideDailynote: vi.fn(() => savedIsHideDailynote),
    saveIsHideDailynote: vi.fn((value: boolean) => {
        savedIsHideDailynote = value;
    }),
    STATE_STORAGE_NAME: "graph-enhance-state",
}));

vi.mock("../settings", () => ({
    getSetting: vi.fn(() => "false"),
}));

vi.mock("../renderer", () => ({
    initEChart,
    resize: vi.fn(),
}));

vi.mock("../constants", () => ({
    GRAPH_API_CONF: {},
}));

vi.mock("../index.scss", () => ({}));

describe("dock", () => {
    let dom: JSDOM;

    beforeEach(() => {
        vi.clearAllMocks();
        savedIsHideDailynote = true;
        dockInit = undefined;

        dom = new JSDOM("<body></body>");
        Object.defineProperty(globalThis, "window", {
            value: dom.window,
            configurable: true,
        });
        Object.defineProperty(globalThis, "document", {
            value: dom.window.document,
            configurable: true,
        });
        Object.defineProperty(globalThis, "HTMLElement", {
            value: dom.window.HTMLElement,
            configurable: true,
        });
    });

    afterEach(() => {
        dom.window.close();
    });

    it("restores persisted hidden dailynote state on dock init", async () => {
        const { initDock } = await import("../dock");

        initDock();

        const element = document.createElement("div");
        document.body.appendChild(element);
        dockInit?.call({ element });
        await Promise.resolve();

        expect(setGraphType).toHaveBeenCalledWith("ancestor");
        expect(setIsHideDailynote).toHaveBeenCalledWith(true);
        expect(initEChart).toHaveBeenCalledTimes(1);
        expect(document.getElementById("graph_enhance_dailynote")?.getAttribute("aria-label")).toBe("Show DailyNote");
        expect(document.getElementById("graph_enhance_dailynote_icon")?.getAttribute("style")).toBe("fill: #5f6368;");
    });
});