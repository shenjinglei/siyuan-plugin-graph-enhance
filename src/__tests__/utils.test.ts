// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getAutoFollowFilter,
    createDefaultGraphPersistedState,
    GRAPH_STATE_STORAGE_NAME,
    getGraphPersistedState,
    getHideDailyNotesFilter,
    getLastHorizontalRankdir,
    getLastVerticalRankdir,
    getPersistedGraphRankdir,
    getPersistedGraphViewMode,
    getThemeMode,
    normalizeGraphPersistedState,
    saveAutoFollowFilter,
    saveGraphPersistedState,
    saveHideDailyNotesFilter,
    savePersistedGraphRankdir,
    savePersistedGraphViewMode,
    setPlugin,
} from "../utils";

describe("utils/getThemeMode test suite", () => {
    const saveData = vi.fn();

    beforeEach(() => {
        document.documentElement.removeAttribute("data-theme-mode");
        saveData.mockReset();
        setPlugin({
            data: {},
            i18n: {},
            saveData,
        } as any);
    });

    afterEach(() => {
        document.documentElement.removeAttribute("data-theme-mode");
    });

    it("should return undefined when no theme mode is set", () => {
        expect(getThemeMode()).toBe(undefined);
    });

    it("should return the theme mode when it is set", () => {
        document.documentElement.setAttribute("data-theme-mode", "light");
        expect(getThemeMode()).toBe("light");
    });

    it("should return the theme mode when it is set", () => {
        document.documentElement.setAttribute("data-theme-mode", "dark");
        expect(getThemeMode()).toBe("dark");
    });

    it("creates the default graph persisted state", () => {
        expect(createDefaultGraphPersistedState()).toEqual({
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: false, autoFollow: true },
            layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
        });
    });

    it("normalizes partial persisted graph state", () => {
        expect(normalizeGraphPersistedState({
            filters: { hideDailyNotes: true },
        })).toEqual({
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true, autoFollow: true },
            layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
        });
    });

    it("reads normalized persisted graph state from plugin data", () => {
        setPlugin({
            data: {
                [GRAPH_STATE_STORAGE_NAME]: {
                    view: { mode: "global" },
                },
            },
            i18n: {},
            saveData,
        } as any);

        expect(getGraphPersistedState()).toEqual({
            version: 1,
            view: { mode: "global" },
            filters: { hideDailyNotes: false, autoFollow: true },
            layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
        });
        expect(getPersistedGraphViewMode()).toBe("global");
        expect(getHideDailyNotesFilter()).toBe(false);
        expect(getAutoFollowFilter()).toBe(true);
    });

    it("saves merged persisted graph state patches", () => {
        setPlugin({
            data: {
                [GRAPH_STATE_STORAGE_NAME]: {
                    version: 1,
                    view: { mode: "ancestor" },
                    filters: { hideDailyNotes: false, autoFollow: true },
                },
            },
            i18n: {},
            saveData,
        } as any);

        saveGraphPersistedState({
            filters: { hideDailyNotes: true },
        });

        expect(saveData).toHaveBeenCalledWith(GRAPH_STATE_STORAGE_NAME, {
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true, autoFollow: true },
            layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
        });
    });

    it("coerces invalid/legacy view modes to default mode", () => {
        // Test legacy modes like "neighbor" and "path" which may be in stored data
        const legacyModes = ["neighbor", "path", "unknown", "invalid"];

        legacyModes.forEach((legacyMode) => {
            const result = normalizeGraphPersistedState({
                view: { mode: legacyMode as any },
                filters: { hideDailyNotes: true, autoFollow: false },
            });

            expect(result).toEqual({
                version: 1,
                view: { mode: "ancestor" }, // Should fall back to default
                filters: { hideDailyNotes: true, autoFollow: false },
                layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
            });
        });
    });

    it("preserves valid view modes during normalization", () => {
        const validModes = ["ancestor", "brother", "cross", "global"];

        validModes.forEach((validMode) => {
            const result = normalizeGraphPersistedState({
                view: { mode: validMode as any },
            });

            expect(result.view.mode).toBe(validMode);
        });
    });

    it("coerces invalid persisted rankdir to the default", () => {
        const result = normalizeGraphPersistedState({
            layout: { rankdir: "invalid" as any },
        });

        expect(result.layout).toEqual({ rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" });
    });

    it("reads and writes the persisted rankdir, tracking the last direction per axis", () => {
        const pluginData: Record<string, unknown> = {
            [GRAPH_STATE_STORAGE_NAME]: {
                version: 1,
                view: { mode: "ancestor" },
                filters: { hideDailyNotes: false, autoFollow: true },
                layout: { rankdir: "LR", lastVertical: "TB", lastHorizontal: "LR" },
            },
        };
        const persistingSaveData = vi.fn((key: string, value: unknown) => {
            pluginData[key] = value;
        });
        setPlugin({
            data: pluginData,
            i18n: {},
            saveData: persistingSaveData,
        } as any);

        expect(getPersistedGraphRankdir()).toBe("LR");
        expect(getLastVerticalRankdir()).toBe("TB");
        expect(getLastHorizontalRankdir()).toBe("LR");

        savePersistedGraphRankdir("BT");

        expect(persistingSaveData).toHaveBeenCalledWith(GRAPH_STATE_STORAGE_NAME, expect.objectContaining({
            layout: { rankdir: "BT", lastVertical: "BT", lastHorizontal: "LR" },
        }));

        savePersistedGraphRankdir("RL");

        expect(persistingSaveData).toHaveBeenCalledWith(GRAPH_STATE_STORAGE_NAME, expect.objectContaining({
            layout: { rankdir: "RL", lastVertical: "BT", lastHorizontal: "RL" },
        }));
    });
});