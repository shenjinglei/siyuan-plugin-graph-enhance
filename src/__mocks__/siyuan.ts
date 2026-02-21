/** Stub for siyuan in tests (no DOM/Siyuan runtime). */
export function showMessage(_msg: string, _duration?: number, _type?: string) { }
export const adaptHotkey = (key: string) => key;
export const fetchSyncPost = async (_url: string, _body: unknown) => ({ data: { nodes: [], links: [] } });
export const getFrontend = () => "desktop";
export const openTab = (_opts: unknown) => { };
export const Setting = class { };
export type I18N = Record<string, string>;
