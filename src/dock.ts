import { enhancedGraph } from "./graph";
import { pluginSetting } from "./settings";
import { i18n, plugin, isMobile } from "./utils";
import { adaptHotkey, fetchSyncPost } from "siyuan";

import "./index.scss";
const DOCK_TYPE = "dock_tab";

export function initDock() {
    const dockHtml = `<div class="fn__flex-1 fn__flex-column">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconM"></use></svg>
            ${i18n.pluginName}
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span id="graph_enhance_global" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnGlobel}"><svg><use xlink:href="#iconLanguage"></use></svg></span>
        <span id="graph_enhance_ancestor" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnAncestor}"><svg><use xlink:href="#iconGraph"></use></svg></span>
        <span id="graph_enhance_brother" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnBrother}"><svg><use xlink:href="#iconWorkspace"></use></svg></span>
        <span id="graph_enhance_refresh" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnRefresh}"><svg><use xlink:href="#iconRefresh"></use></svg></span>
        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
    </div>
    <div class="fn__flex-1 plugin-sample__custom-dock">
    <div id="graph_enhance_container" style="position:absolute;width:100%;height:100%;" ></div>
    </div>
    </div>`;

    plugin.addDock({
        config: {
            position: "RightTop",
            size: { width: 300, height: 500 },
            icon: "iconM",
            title: i18n.pluginName,
        },
        data: {
            text: "graph-enhance-hello-world"
        },
        type: DOCK_TYPE,
        init() {
            this.element.innerHTML = dockHtml;

            document.getElementById("graph_enhance_refresh").onclick = async () => {
                await refreashGraph();
                enhancedGraph.Display();
            };

            document.getElementById("graph_enhance_global").onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    enhancedGraph.sourceNodeId = curDocId;

                if (!enhancedGraph.rawGraph) {
                    await refreashGraph();
                }

                enhancedGraph.searchMethod = "global";
                enhancedGraph.Display();
            };

            document.getElementById("graph_enhance_ancestor").onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    enhancedGraph.sourceNodeId = curDocId;

                if (!enhancedGraph.rawGraph) {
                    await refreashGraph();
                }

                enhancedGraph.searchMethod = "ancestor";
                enhancedGraph.Display();
            };

            document.getElementById("graph_enhance_brother").onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    enhancedGraph.sourceNodeId = curDocId;

                if (!enhancedGraph.rawGraph) {
                    await refreashGraph();
                }

                enhancedGraph.searchMethod = "brother";
                enhancedGraph.Display();
            };

            enhancedGraph.init();
            pluginSetting.init();
        },
        resize() {
            const container = document.getElementById("graph_enhance_container");
            enhancedGraph.resize({
                width: container.offsetWidth,
                height: container.offsetHeight
            });
        },
        destroy() {
            console.log("destroy dock:", DOCK_TYPE);
        }
    });
}

//获取当前文档id
function getDocid() {
    if (isMobile)
        return document.querySelector("#editor .protyle-content .protyle-background")?.getAttribute("data-node-id");
    else
        return document.querySelector(".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background")?.getAttribute("data-node-id");
}

function refreashGraph() {
    return new Promise<void>((resolve, reject) => {
        fetchSyncPost("api/graph/getGraph", {
            "conf": {
                "dailyNote": pluginSetting.getSetting("dailynoteExcluded") !== "true",
                "minRefs": 0,
                "type": {
                    "blockquote": false,
                    "code": false,
                    "heading": false,
                    "list": false,
                    "listItem": false,
                    "math": false,
                    "paragraph": false,
                    "super": false,
                    "table": false,
                    "tag": false
                }
            },
            "k": ""
        }).then(
            result => {
                console.log(result);
                enhancedGraph.initRawGraph(result.data.nodes, result.data.links);
                resolve();
            }
        );
    });

}