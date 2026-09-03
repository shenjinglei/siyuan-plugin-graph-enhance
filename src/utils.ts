import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";
import { graphlib } from "@dagrejs/dagre";
import { GRAPH_TYPES } from "./constants";
import type { DagreNodeValue, GraphPersistedState, GraphPersistedStatePatch, GraphRankDir, GraphType, HorizontalRankDir, VerticalRankDir } from "./types";

export let i18n: I18N;
export let plugin: GraphEnhancePlugin;

export function setPlugin(instance: GraphEnhancePlugin) {
    plugin = instance;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";
export const GRAPH_STATE_STORAGE_NAME = "graph-enhance-graph-state";
export const GRAPH_STATE_VERSION = 1;

export let rawGraph: graphlib.Graph<DagreNodeValue>;
export function setRawGraph(g: graphlib.Graph<DagreNodeValue>) {
    rawGraph = g;
}

/** Current theme mode from document (e.g. "dark" / "light") */
export function getThemeMode(): string | undefined {
    return document.querySelector("html")?.getAttribute("data-theme-mode") ?? undefined;
}

const VERTICAL_RANK_DIRS: readonly VerticalRankDir[] = ["TB", "BT"];
const HORIZONTAL_RANK_DIRS: readonly HorizontalRankDir[] = ["LR", "RL"];
const RANK_DIRS: readonly GraphRankDir[] = [...VERTICAL_RANK_DIRS, ...HORIZONTAL_RANK_DIRS];

export function createDefaultGraphPersistedState(): GraphPersistedState {
    return {
        version: GRAPH_STATE_VERSION,
        view: {
            mode: "ancestor",
        },
        filters: {
            hideDailyNotes: false,
            autoFollow: true,
        },
        layout: {
            rankdir: "LR",
            lastVertical: "TB",
            lastHorizontal: "LR",
        },
    };
}

export function normalizeGraphPersistedState(state?: GraphPersistedStatePatch): GraphPersistedState {
    const defaultState = createDefaultGraphPersistedState();
    const persistedMode = state?.view?.mode;
    const mode: GraphType =
        persistedMode && GRAPH_TYPES.includes(persistedMode)
            ? persistedMode
            : defaultState.view.mode;

    const persistedRankdir = state?.layout?.rankdir;
    const rankdir: GraphRankDir =
        persistedRankdir && RANK_DIRS.includes(persistedRankdir)
            ? persistedRankdir
            : defaultState.layout.rankdir;

    const persistedLastVertical = state?.layout?.lastVertical;
    const lastVertical: VerticalRankDir =
        persistedLastVertical && VERTICAL_RANK_DIRS.includes(persistedLastVertical)
            ? persistedLastVertical
            : defaultState.layout.lastVertical;

    const persistedLastHorizontal = state?.layout?.lastHorizontal;
    const lastHorizontal: HorizontalRankDir =
        persistedLastHorizontal && HORIZONTAL_RANK_DIRS.includes(persistedLastHorizontal)
            ? persistedLastHorizontal
            : defaultState.layout.lastHorizontal;

    return {
        version: GRAPH_STATE_VERSION,
        view: {
            mode,
        },
        filters: {
            hideDailyNotes: state?.filters?.hideDailyNotes ?? defaultState.filters.hideDailyNotes,
            autoFollow: state?.filters?.autoFollow ?? defaultState.filters.autoFollow,
        },
        layout: {
            rankdir,
            lastVertical,
            lastHorizontal,
        },
    };
}

export function getGraphPersistedState(): GraphPersistedState {
    return normalizeGraphPersistedState(plugin.data[GRAPH_STATE_STORAGE_NAME]);
}

export function saveGraphPersistedState(state: GraphPersistedStatePatch): void {
    const currentState = getGraphPersistedState();
    const nextState = normalizeGraphPersistedState({
        ...currentState,
        ...state,
        view: {
            ...currentState.view,
            ...state.view,
        },
        filters: {
            ...currentState.filters,
            ...state.filters,
        },
        layout: {
            ...currentState.layout,
            ...state.layout,
        },
    });

    plugin.saveData(GRAPH_STATE_STORAGE_NAME, nextState);
}

export function getPersistedGraphViewMode(): GraphType {
    return getGraphPersistedState().view.mode;
}

export function savePersistedGraphViewMode(mode: GraphType): void {
    saveGraphPersistedState({
        view: { mode },
    });
}

export function getHideDailyNotesFilter(): boolean {
    return getGraphPersistedState().filters.hideDailyNotes;
}

export function saveHideDailyNotesFilter(hideDailyNotes: boolean): void {
    saveGraphPersistedState({
        filters: { hideDailyNotes },
    });
}

export function getAutoFollowFilter(): boolean {
    return getGraphPersistedState().filters.autoFollow;
}

export function saveAutoFollowFilter(autoFollow: boolean): void {
    saveGraphPersistedState({
        filters: { autoFollow },
    });
}

export function getPersistedGraphRankdir(): GraphRankDir {
    return getGraphPersistedState().layout.rankdir;
}

export function getLastVerticalRankdir(): VerticalRankDir {
    return getGraphPersistedState().layout.lastVertical;
}

export function getLastHorizontalRankdir(): HorizontalRankDir {
    return getGraphPersistedState().layout.lastHorizontal;
}

export function savePersistedGraphRankdir(rankdir: GraphRankDir): void {
    const isVertical: boolean = (VERTICAL_RANK_DIRS as readonly GraphRankDir[]).includes(rankdir);
    saveGraphPersistedState({
        layout: {
            rankdir,
            ...(isVertical ? { lastVertical: rankdir as VerticalRankDir } : { lastHorizontal: rankdir as HorizontalRankDir }),
        },
    });
}