// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    createDefaultGraphPersistedState,
    getGraphPersistedState,
    getHideDailyNotesFilter,
    getPersistedGraphViewMode,
    getThemeMode,
    normalizeGraphPersistedState,
    saveGraphPersistedState,
    saveHideDailyNotesFilter,
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
            filters: { hideDailyNotes: false },
        });
    });

    it("normalizes partial persisted graph state", () => {
        expect(normalizeGraphPersistedState({
            filters: { hideDailyNotes: true },
        })).toEqual({
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true },
        });
    });

    it("reads normalized persisted graph state from plugin data", () => {
        setPlugin({
            data: {
                "graph-enhance-graph-state": {
                    view: { mode: "global" },
                },
            },
            i18n: {},
            saveData,
        } as any);

        expect(getGraphPersistedState()).toEqual({
            version: 1,
            view: { mode: "global" },
            filters: { hideDailyNotes: false },
        });
        expect(getPersistedGraphViewMode()).toBe("global");
        expect(getHideDailyNotesFilter()).toBe(false);
    });

    it("saves merged persisted graph state patches", () => {
        setPlugin({
            data: {
                "graph-enhance-graph-state": {
                    version: 1,
                    view: { mode: "ancestor" },
                    filters: { hideDailyNotes: false },
                },
            },
            i18n: {},
            saveData,
        } as any);

        saveGraphPersistedState({
            filters: { hideDailyNotes: true },
        });

        expect(saveData).toHaveBeenCalledWith("graph-enhance-graph-state", {
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true },
        });
    });

    it("saves semantic view mode and daily note filter helpers", () => {
        savePersistedGraphViewMode("path");
        saveHideDailyNotesFilter(true);

        expect(saveData).toHaveBeenNthCalledWith(1, "graph-enhance-graph-state", {
            version: 1,
            view: { mode: "path" },
            filters: { hideDailyNotes: false },
        });
        expect(saveData).toHaveBeenNthCalledWith(2, "graph-enhance-graph-state", {
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true },
        });
    });
});