import {
    Plugin,
    getFrontend,
    getBackend
} from "siyuan";
import "./index.scss";

import { setI18n, STORAGE_NAME, setPlugin } from "./utils";

import { initDock } from "./dock";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        setI18n(this.i18n);
        setPlugin(this);
        initDock();

        this.addCommand({
            langKey: "showDialog",
            hotkey: "⇧⌘O",
            callback: () => {
                console.log("showDialog!");
                console.log(this.getOpenedTab());
            },
        });

        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log("get tab!");
                console.log(this.getOpenedTab());
            },
        });

        console.log(this.i18n.helloPlugin);
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME).then(
            x => Object.assign(x, { rankdir: "LR", ranker: "longest-path", dailynoteExcluded: "false" })
        );
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }

}
