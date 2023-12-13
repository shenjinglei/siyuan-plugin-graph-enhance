import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";
import { graphlib } from "@dagrejs/dagre";
import type { DagreNodeValue } from "./types";

export let i18n: I18N;

export let plugin: GraphEnhancePlugin;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";

export let rawGraph: graphlib.Graph<DagreNodeValue>;
export function setRawGraph(_rawGraph: graphlib.Graph<any>) {
    rawGraph = _rawGraph;
}