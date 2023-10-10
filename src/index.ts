import { Plugin } from "siyuan";
import "./index.scss";

import { setI18n, STORAGE_NAME, setPlugin } from "./utils";
import { initDock } from "./dock";
import { settingInit } from "./settings";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        this.data[STORAGE_NAME] = {
            rankdir: "LR",
            ranker: "longest-path",
            dailynoteExcluded: "false",
            nodesMaximum: "200"
        };
        setI18n(this.i18n);
        setPlugin(this);
        initDock();
        settingInit();
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
    }
}
