import { Plugin } from "siyuan";
import "./index.scss";

import { GRAPH_STATE_STORAGE_NAME, STORAGE_NAME, normalizeGraphPersistedState, setPlugin } from "./utils";
import { initDock } from "./dock";
import { DEFAULT_SETTINGS, settingInit } from "./settings";

export default class GraphEnhancePlugin extends Plugin {
    async onload() {
        this.addIcons(`<symbol id="iconGraphEnhance" viewBox="0 0 32 32">
        <path d="M30.5 24h-0.5v-6.5c0-1.93-1.57-3.5-3.5-3.5h-8.5v-4h0.5c0.825 0 1.5-0.675 1.5-1.5v-5c0-0.825-0.675-1.5-1.5-1.5h-5c-0.825 0-1.5 0.675-1.5 1.5v5c0 0.825 0.675 1.5 1.5 1.5h0.5v4h-8.5c-1.93 0-3.5 1.57-3.5 3.5v6.5h-0.5c-0.825 0-1.5 0.675-1.5 1.5v5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-5c0-0.825-0.675-1.5-1.5-1.5h-0.5v-6h8v6h-0.5c-0.825 0-1.5 0.675-1.5 1.5v5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-5c0-0.825-0.675-1.5-1.5-1.5h-0.5v-6h8v6h-0.5c-0.825 0-1.5 0.675-1.5 1.5v5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-5c0-0.825-0.675-1.5-1.5-1.5zM6 30h-4v-4h4v4zM18 30h-4v-4h4v4zM14 8v-4h4v4h-4zM30 30h-4v-4h4v4z"></path>
        </symbol><symbol id="iconFullscreen" viewBox="0 0 32 32">
        <path d="M4 4h8v2h-6v6h-2v-8zM10 26h-6v-6h2v6h6v2zM28 4h-8v2h6v6h2v-8zM22 26v2h8v-8h-2v6h-6z"></path>
        </symbol><symbol id="iconAutoFollow" viewBox="0 0 32 32">
        <path d="M25.414 10.586l-8-8c-0.781-0.781-2.047-0.781-2.828 0l-8 8 2.828 2.828 4.586-4.586v11.172c0 3.309 2.691 6 6 6h6v4l6-6-6-6v4h-6c-1.103 0-2-0.897-2-2v-11.172l4.586 4.586 2.828-2.828z"></path>
        </symbol><symbol id="iconDirVertical" viewBox="0 0 32 32">
        <path d="M14 4h4v14h6l-8 10-8-10h6z"></path>
        </symbol><symbol id="iconDirHorizontal" viewBox="0 0 32 32">
        <path d="M4 14v4h14v6l10-8-10-8v6z"></path>
        </symbol>`);

        await this.loadData(STORAGE_NAME);
        const { autoFollow: _, ...storedSettings } = this.data[STORAGE_NAME] ?? {};
        this.saveData(STORAGE_NAME, { ...DEFAULT_SETTINGS, ...storedSettings });

        await this.loadData(GRAPH_STATE_STORAGE_NAME);
        this.saveData(GRAPH_STATE_STORAGE_NAME, normalizeGraphPersistedState(this.data[GRAPH_STATE_STORAGE_NAME]));

        setPlugin(this);
        initDock();
        settingInit();

        console.log("graph-enhance loaded");
    }

    async uninstall() {
        await this.removeData(STORAGE_NAME);
        await this.removeData(GRAPH_STATE_STORAGE_NAME);
        console.log("graph-enhance uninstalled");
    }
}

