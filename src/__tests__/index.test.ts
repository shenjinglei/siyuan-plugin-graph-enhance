import { describe, expect, it, vi } from "vitest";

const initDock = vi.fn();
const settingInit = vi.fn();

vi.mock("../dock", () => ({
    initDock,
}));

vi.mock("../settings", () => ({
    DEFAULT_SETTINGS: {
        ranker: "network-simplex",
        nodesMaximum: "200",
        nodesExclusion: "",
        font: "system-ui",
        fontSize: "12",
    },
    settingInit,
}));

vi.mock("../index.scss", () => ({}));

vi.mock("siyuan", () => ({
    Plugin: class {
        data = {
            "graph-enhance-config": {
                autoFollow: "false",
                nodesMaximum: "300",
            },
            "graph-enhance-graph-state": {
                version: 1,
                view: { mode: "global" },
                filters: { hideDailyNotes: true },
            },
        };

        addIcons = vi.fn();
        loadData = vi.fn(async () => undefined);
        saveData = vi.fn((key: string, value: unknown) => {
            this.data[key] = value;
        });
        removeData = vi.fn(async () => undefined);
    },
}));

describe("plugin startup", () => {
    it("defaults autoFollow on in graph runtime state and removes the legacy settings key", async () => {
        const { default: GraphEnhancePlugin } = await import("../index");

        const plugin = new GraphEnhancePlugin();
        await plugin.onload();

        expect(plugin.saveData).toHaveBeenNthCalledWith(1, "graph-enhance-config", {
            ranker: "network-simplex",
            nodesMaximum: "300",
            nodesExclusion: "",
            font: "system-ui",
            fontSize: "12",
        });
        expect(plugin.saveData).toHaveBeenNthCalledWith(2, "graph-enhance-graph-state", {
            version: 1,
            view: { mode: "global" },
            filters: { hideDailyNotes: true, autoFollow: true },
            layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
        });
        expect(initDock).toHaveBeenCalledTimes(1);
        expect(settingInit).toHaveBeenCalledTimes(1);
    });
});
