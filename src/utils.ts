import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";
import { graphlib } from "@dagrejs/dagre";
import type { DagreNodeValue, GraphEnhanceState, GraphType } from "./types";

export let i18n: I18N;
export let plugin: GraphEnhancePlugin;

export function setPlugin(instance: GraphEnhancePlugin) {
    plugin = instance;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";
export const STATE_STORAGE_NAME = "graph-enhance-state";

export let rawGraph: graphlib.Graph<DagreNodeValue>;
export function setRawGraph(g: graphlib.Graph<DagreNodeValue>) {
    rawGraph = g;
}

/** Current theme mode from document (e.g. "dark" / "light") */
export function getThemeMode(): string | undefined {
    return document.querySelector("html")?.getAttribute("data-theme-mode") ?? undefined;
}

/** State management functions */
export function getState(): GraphEnhanceState {
    console.log("getState", plugin.data[STATE_STORAGE_NAME]);
    return plugin.data[STATE_STORAGE_NAME] || {};
}

export function saveState(state: Partial<GraphEnhanceState>): void {
    const currentState = getState();
    const newState = { ...currentState, ...state };
    plugin.saveData(STATE_STORAGE_NAME, newState);
}

export function getGraphType(): GraphType {
    return getState().graphType ?? "ancestor";
}

export function saveGraphType(graphType: GraphType): void {
    saveState({ graphType });
}

export function getIsHideDailynote(): boolean {
    return getState().isHideDailynote ?? false;
}

export function saveIsHideDailynote(isHideDailynote: boolean): void {
    saveState({ isHideDailynote });
}