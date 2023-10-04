import GraphEnhancePlugin from ".";

export let i18n: any;
export function setI18n(_i18n: any) {
    i18n = _i18n;
}

export let plugin: GraphEnhancePlugin;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
}

export const STORAGE_NAME = "graph-enhance-config";