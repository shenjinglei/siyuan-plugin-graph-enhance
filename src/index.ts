import { Plugin } from "siyuan";
import "./index.scss";

import { setI18n, STORAGE_NAME, setPlugin } from "./utils";

import { initDock } from "./dock";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        setI18n(this.i18n);
        setPlugin(this);
        initDock();
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME).then(
            x => Object.assign(x, {
                rankdir: "LR",
                ranker: "longest-path",
                dailynoteExcluded: "false"
            })
        );
    }
}
