import GraphEnhancePlugin from ".";
import { getFrontend } from "siyuan";

export let i18n: any;
export function setI18n(_i18n: any) {
    i18n = _i18n;
}

export let plugin: GraphEnhancePlugin;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
}

export const STORAGE_NAME = "graph-enhance-config";

const frontEnd = getFrontend();
export const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";