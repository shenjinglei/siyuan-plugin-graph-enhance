import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";
import { graphlib } from "@dagrejs/dagre";
import type { DagreNodeValue } from "./types";

export let i18n: I18N;
export let plugin: GraphEnhancePlugin;

export function setPlugin(instance: GraphEnhancePlugin) {
    plugin = instance;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";

export let rawGraph: graphlib.Graph<DagreNodeValue>;
export function setRawGraph(g: graphlib.Graph<DagreNodeValue>) {
    rawGraph = g;
}

/** Current theme mode from document (e.g. "dark" / "light") */
export function getThemeMode(): string | undefined {
    return document.querySelector("html")?.getAttribute("data-theme-mode") ?? undefined;
}