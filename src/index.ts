import { Plugin } from "siyuan";
import "./index.scss";

import { setI18n, STORAGE_NAME, setPlugin } from "./utils";
import { initDock } from "./dock";
import { settingInit } from "./settings";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        this.loadData(STORAGE_NAME).then(() => {
            this.saveData(
                STORAGE_NAME,
                Object.assign({
                    rankdir: "LR",
                    ranker: "network-simplex",
                    dailynoteExcluded: "false",
                    nodesMaximum: "200",
                    neighborDepth: "2",
                    autoFollow: "false",
                    sourceThreshold: "3",
                    sinkThreshold: "3",
                    separation: "",
                }, this.data[STORAGE_NAME])
            );


        });

        setI18n(this.i18n);
        setPlugin(this);
        initDock();
        settingInit();
    }
}
