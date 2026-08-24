import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

const setIsHideDailynote = vi.fn();
const setGraphType = vi.fn();
const initEChart = vi.fn();
const saveAutoFollowFilter = vi.fn((value: boolean) => {
    savedAutoFollow = value;
});
const saveHideDailyNotesFilter = vi.fn((value: boolean) => {
    savedHideDailyNotes = value;
});
const savePersistedGraphViewMode = vi.fn();

let savedAutoFollow = true;
let savedHideDailyNotes = true;
let dockInit: (() => void) | undefined;
let dockResize: (() => void) | undefined;
const eventBusOn = vi.fn();
const eventBusOff = vi.fn();

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
        dockBtnEnableAutoFollow: "Enable Auto Follow",
        dockBtnDisableAutoFollow: "Disable Auto Follow",
        dockBtnHideDN: "Hide DailyNote",
        dockBtnShowDN: "Show DailyNote",
        dockBtnGlobal: "Global Graph",
        dockBtnCross: "Cross Graph",
        dockBtnAncestor: "Ancestor Graph",
        dockBtnBrother: "Brother Graph",
        dockBtnRefresh: "Refresh",
        dockBtnFullscreen: "Fullscreen",
        dockBtnExitFullscreen: "Exit Fullscreen",
    },
    plugin: {
        addDock: vi.fn(({ init, resize }: { init: () => void; resize: () => void }) => {
            dockInit = init;
            dockResize = resize;
        }),
        loadData: vi.fn(() => Promise.resolve()),
        eventBus: { on: eventBusOn, off: eventBusOff },
    },
    rawGraph: undefined,
    getAutoFollowFilter: vi.fn(() => savedAutoFollow),
    getPersistedGraphViewMode: vi.fn(() => "ancestor"),
    saveAutoFollowFilter,
    savePersistedGraphViewMode,
    getHideDailyNotesFilter: vi.fn(() => savedHideDailyNotes),
    saveHideDailyNotesFilter,
    GRAPH_STATE_STORAGE_NAME: "graph-enhance-graph-state",
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
        savedAutoFollow = true;
        savedHideDailyNotes = true;
        dockInit = undefined;
        dockResize = undefined;

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

    function mountDock() {
        const element = document.createElement("div");
        document.body.appendChild(element);
        dockInit?.call({ element });
        return element;
    }

    function setContainerSize(width: number, height: number) {
        const container = document.getElementById("graph_enhance_container");
        Object.defineProperty(container, "offsetWidth", {
            value: width,
            configurable: true,
        });
        Object.defineProperty(container, "offsetHeight", {
            value: height,
            configurable: true,
        });
    }

    afterEach(() => {
        dom.window.close();
    });

    it("restores persisted hidden dailynote and auto follow state on dock init", async () => {
        const { initDock } = await import("../dock");

        initDock();

        mountDock();
        await Promise.resolve();

        expect(setGraphType).toHaveBeenCalledWith("ancestor");
        expect(setIsHideDailynote).toHaveBeenCalledWith(true);
        expect(initEChart).toHaveBeenCalledTimes(1);
        expect(document.getElementById("graph_enhance_autofollow")?.getAttribute("aria-label")).toBe("Disable Auto Follow");
        expect(document.getElementById("graph_enhance_autofollow_icon")?.classList.contains("plugin-sample__dock-icon--active")).toBe(true);
        expect(document.getElementById("graph_enhance_dailynote")?.getAttribute("aria-label")).toBe("Show DailyNote");
        expect(document.getElementById("graph_enhance_dailynote_icon")?.classList.contains("plugin-sample__dock-icon--active")).toBe(false);
        expect(document.querySelectorAll(".plugin-sample__dock-divider")).toHaveLength(2);
    });

    it("persists the daily note filter with the semantic state helper", async () => {
        const { initDock } = await import("../dock");

        initDock();

        mountDock();
        await Promise.resolve();

        await document.getElementById("graph_enhance_dailynote")?.onclick?.(new dom.window.MouseEvent("click") as any);

        expect(saveHideDailyNotesFilter).toHaveBeenCalledWith(false);
    });

    it("persists auto follow with the semantic state helper and registers listener when visible", async () => {
        const { initDock, autoFollow } = await import("../dock");

        savedAutoFollow = false;
        initDock();

        mountDock();
        setContainerSize(320, 240);
        dockResize?.call({});
        await Promise.resolve();

        await document.getElementById("graph_enhance_autofollow")?.onclick?.(new dom.window.MouseEvent("click") as any);

        expect(saveAutoFollowFilter).toHaveBeenCalledWith(true);
        expect(eventBusOff).toHaveBeenCalledWith("switch-protyle", autoFollow);
        expect(eventBusOn).toHaveBeenCalledWith("switch-protyle", autoFollow);
        expect(document.getElementById("graph_enhance_autofollow")?.getAttribute("aria-label")).toBe("Disable Auto Follow");
    });

    it("persists the graph view mode with the semantic state helper", async () => {
        const { initDock } = await import("../dock");

        initDock();

        mountDock();
        await Promise.resolve();

        await document.getElementById("graph_enhance_global")?.onclick?.(new dom.window.MouseEvent("click") as any);

        expect(savePersistedGraphViewMode).toHaveBeenCalledWith("global");
    });
});