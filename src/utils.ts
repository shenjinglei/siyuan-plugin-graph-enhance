import * as echarts from "echarts/core";
import GraphEnhancePlugin from ".";
import { I18N } from "siyuan";

export let i18n: I18N;

export let plugin: GraphEnhancePlugin;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
    i18n = plugin.i18n;
}

export const STORAGE_NAME = "graph-enhance-config";

export let aEChart: echarts.ECharts;
export function setEChart() {
    aEChart = echarts.init(document.getElementById("graph_enhance_container"));
}