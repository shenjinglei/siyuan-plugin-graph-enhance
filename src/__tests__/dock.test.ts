import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

const setIsHideDailynote = vi.fn();
const setGraphType = vi.fn();
const initEChart = vi.fn();
const saveHideDailyNotesFilter = vi.fn((value: boolean) => {
    savedHideDailyNotes = value;
});
const savePersistedGraphViewMode = vi.fn();

let savedHideDailyNotes = true;
let dockInit: (() => void) | undefined;

vi.mock("../graph", () => ({
    Display: vi.fn(),
    initRawGraph: vi.fn(),
    setGraphType,
    setIsHideDailynote,
    setSourceNode: vi.fn(),
}));

vi.mock("siyuan", () => ({
    adaptHotkey: vi.fn((hotkey: string) => hotkey),
    fetchSyncPost: vi.fn(async () => ({
        data: {
            nodes: [],
            links: [],
        },
    })),
    getFrontend: vi.fn(() => "desktop"),
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
    getPersistedGraphViewMode: vi.fn(() => "ancestor"),
    savePersistedGraphViewMode,
    getHideDailyNotesFilter: vi.fn(() => savedHideDailyNotes),
    saveHideDailyNotesFilter,
    GRAPH_STATE_STORAGE_NAME: "graph-enhance-graph-state",
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
        savedHideDailyNotes = true;
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
        expect(document.getElementById("graph_enhance_dailynote_icon")?.classList.contains("plugin-sample__dock-icon--active")).toBe(false);
    });

    it("persists the daily note filter with the semantic state helper", async () => {
        const { initDock } = await import("../dock");

        initDock();

        const element = document.createElement("div");
        document.body.appendChild(element);
        dockInit?.call({ element });
        await Promise.resolve();

        await document.getElementById("graph_enhance_dailynote")?.onclick?.(new dom.window.MouseEvent("click") as any);

        expect(saveHideDailyNotesFilter).toHaveBeenCalledWith(false);
    });

    it("persists the graph view mode with the semantic state helper", async () => {
        const { initDock } = await import("../dock");

        initDock();

        const element = document.createElement("div");
        document.body.appendChild(element);
        dockInit?.call({ element });
        await Promise.resolve();

        await document.getElementById("graph_enhance_global")?.onclick?.(new dom.window.MouseEvent("click") as any);

        expect(savePersistedGraphViewMode).toHaveBeenCalledWith("global");
    });
});