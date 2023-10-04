import {
    Plugin,
    adaptHotkey,
    getFrontend,
    getBackend
} from "siyuan";
import "./index.scss";

import { setI18n, i18n, STORAGE_NAME, setPlugin } from "./utils";
import { enhancedGraph } from "./graph";
import { pluginSetting } from "./settings";


const DOCK_TYPE = "dock_tab";

export default class GraphEnhancePlugin extends Plugin {
    onload() {
        this.init();
        console.log("GraphEnhancePlugin onload");

        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconM",
                title: i18n.pluginName,
            },
            data: {
                text: "graph-enhance-hello-world"
            },
            type: DOCK_TYPE,
            init() {
                this.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconM"></use></svg>
            ${i18n.pluginName}
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
    </div>
    <div class="fn__flex-1 plugin-sample__custom-dock">
        <div id="graph_enhance_container">hello</div>
    </div>
</div>`;

                enhancedGraph.init();
                pluginSetting.init();
            },
            destroy() {
                console.log("destroy dock:", DOCK_TYPE);
            }
        });

        console.log(this.i18n.helloPlugin);
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }

    init() {
        setI18n(this.i18n);
        setPlugin(this);
    }
}
