import { Plugin } from "siyuan";
import "./index.scss";

import { setI18n, STORAGE_NAME, setPlugin } from "./utils";
import { initDock, autoFollow } from "./dock";
import { settingInit } from "./settings";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        this.loadData(STORAGE_NAME).then(() => {
            this.saveData(
                STORAGE_NAME,
                Object.assign({
                    rankdir: "LR",
                    ranker: "longest-path",
                    dailynoteExcluded: "false",
                    nodesMaximum: "200",
                    autoFollow: "false"
                }, this.data[STORAGE_NAME])
            );
        });

        setI18n(this.i18n);
        setPlugin(this);
        initDock();
        settingInit();
    }

    onLayoutReady() {
        if (this.data[STORAGE_NAME].autoFollow === "true") {
            this.eventBus.on("click-editorcontent", autoFollow);
        } else {
            this.eventBus.off("click-editorcontent", autoFollow);
        }
    }
}
