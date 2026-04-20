import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";
import { graphlib } from "@dagrejs/dagre";
import type { DagreNodeValue, GraphPersistedState, GraphPersistedStatePatch, GraphType } from "./types";

export let i18n: I18N;
export let plugin: GraphEnhancePlugin;

export function setPlugin(instance: GraphEnhancePlugin) {
    plugin = instance;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";
export const GRAPH_STATE_STORAGE_NAME = "graph-state";
export const GRAPH_STATE_VERSION = 1;

export let rawGraph: graphlib.Graph<DagreNodeValue>;
export function setRawGraph(g: graphlib.Graph<DagreNodeValue>) {
    rawGraph = g;
}

/** Current theme mode from document (e.g. "dark" / "light") */
export function getThemeMode(): string | undefined {
    return document.querySelector("html")?.getAttribute("data-theme-mode") ?? undefined;
}

export function createDefaultGraphPersistedState(): GraphPersistedState {
    return {
        version: GRAPH_STATE_VERSION,
        view: {
            mode: "ancestor",
        },
        filters: {
            hideDailyNotes: false,
        },
    };
}

export function normalizeGraphPersistedState(state?: GraphPersistedStatePatch): GraphPersistedState {
    const defaultState = createDefaultGraphPersistedState();

    return {
        version: GRAPH_STATE_VERSION,
        view: {
            mode: state?.view?.mode ?? defaultState.view.mode,
        },
        filters: {
            hideDailyNotes: state?.filters?.hideDailyNotes ?? defaultState.filters.hideDailyNotes,
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