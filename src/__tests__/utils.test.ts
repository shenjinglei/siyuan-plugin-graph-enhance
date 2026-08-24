// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getAutoFollowFilter,
    createDefaultGraphPersistedState,
    GRAPH_STATE_STORAGE_NAME,
    getGraphPersistedState,
    getHideDailyNotesFilter,
    getPersistedGraphViewMode,
    getThemeMode,
    normalizeGraphPersistedState,
    saveAutoFollowFilter,
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
            filters: { hideDailyNotes: false, autoFollow: true },
        });
    });

    it("normalizes partial persisted graph state", () => {
        expect(normalizeGraphPersistedState({
            filters: { hideDailyNotes: true },
        })).toEqual({
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true, autoFollow: true },
        });
    });

    it("falls back to the default view mode for invalid persisted values", () => {
        expect(normalizeGraphPersistedState({
            view: { mode: "legacy-mode" as any },
        })).toEqual({
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: false, autoFollow: true },
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
        });
    });

    it("saves semantic view mode and filter helpers", () => {
        savePersistedGraphViewMode("path");
        saveHideDailyNotesFilter(true);
        saveAutoFollowFilter(false);

        expect(saveData).toHaveBeenNthCalledWith(1, GRAPH_STATE_STORAGE_NAME, {
            version: 1,
            view: { mode: "path" },
            filters: { hideDailyNotes: false, autoFollow: true },
        });
        expect(saveData).toHaveBeenNthCalledWith(2, GRAPH_STATE_STORAGE_NAME, {
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: true, autoFollow: true },
        });
        expect(saveData).toHaveBeenNthCalledWith(3, GRAPH_STATE_STORAGE_NAME, {
            version: 1,
            view: { mode: "ancestor" },
            filters: { hideDailyNotes: false, autoFollow: false },
        });
    });
});