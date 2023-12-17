/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Display, initRawGraph, setGraphType, setSourceNode, sourceNode } from "./graph";
import { i18n, plugin, rawGraph } from "./utils";
import { adaptHotkey, fetchSyncPost, getFrontend } from "siyuan";

import "./index.scss";
import { getSetting } from "./settings";
import { initEChart, resize } from "./renderer";
const DOCK_TYPE = "dock_tab";

export function initDock() {
    const dockHtml = `<div class="fn__flex-1 fn__flex-column">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconGraphEnhance"></use></svg>
            ${i18n.pluginName}
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span id="graph_enhance_global" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnGlobal}"><svg><use xlink:href="#iconLanguage"></use></svg></span>
        <span id="graph_enhance_neighbor" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnNeighbor}"><svg><use xlink:href="#iconWorkspace"></use></svg></span>
        <span id="graph_enhance_cross" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnCross}"><svg><use xlink:href="#iconFocus"></use></svg></span>
        <span id="graph_enhance_ancestor" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnAncestor}"><svg><use xlink:href="#iconGraph"></use></svg></span>
        <span id="graph_enhance_brother" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnBrother}"><svg><use xlink:href="#iconGlobalGraph"></use></svg></span>
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
            icon: "iconGraphEnhance",
            title: i18n.pluginName,
        },
        data: {
            text: "graph-enhance-hello-world"
        },
        type: DOCK_TYPE,
        init() {
            this.element.innerHTML = dockHtml;

            document.getElementById("graph_enhance_refresh")!.onclick = async () => {
                await refreashGraph();

                Display();
            };

            document.getElementById("graph_enhance_global")!.onclick = async () => {

                const curDocId = getDocid();
                if (curDocId)
                    setSourceNode(curDocId);

                if (!rawGraph) {
                    await refreashGraph();
                }

                setGraphType("global");

                Display();
            };

            document.getElementById("graph_enhance_ancestor")!.onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    setSourceNode(curDocId);

                if (!rawGraph) {
                    await refreashGraph();
                }

                setGraphType("ancestor");

                Display();
            };

            document.getElementById("graph_enhance_brother")!.onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    setSourceNode(curDocId);

                if (!rawGraph) {
                    await refreashGraph();
                }

                setGraphType("brother");

                Display();
            };

            document.getElementById("graph_enhance_cross")!.onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    setSourceNode(curDocId);

                if (!rawGraph) {
                    await refreashGraph();
                }

                setGraphType("cross");
                Display();
            };

            document.getElementById("graph_enhance_neighbor")!.onclick = async () => {
                const curDocId = getDocid();
                if (curDocId)
                    setSourceNode(curDocId);

                if (!rawGraph) {
                    await refreashGraph();
                }

                setGraphType("neighbor");
                Display();
            };

            initEChart();
        },
        resize() {
            const container = document.getElementById("graph_enhance_container")!;
            resize({
                width: container.offsetWidth,
                height: container.offsetHeight
            });
            if (getSetting("autoFollow") === "true" && container.offsetWidth !== 0 && container.offsetHeight !== 0) {
                plugin.eventBus.off("switch-protyle", autoFollow);
                plugin.eventBus.on("switch-protyle", autoFollow);
            } else {
                plugin.eventBus.off("switch-protyle", autoFollow);
            }
        }
    });
}

function getDocid() {
    if (getFrontend() === "mobile" || getFrontend() === "browser-mobile")
        return document.querySelector("#editor .protyle-content .protyle-background")?.getAttribute("data-node-id");
    else
        return document.querySelector(".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background")?.getAttribute("data-node-id");
}

export async function autoFollow({ detail }: any) {

    if (sourceNode() === detail.protyle.block.rootID) return;

    setSourceNode(detail.protyle.block.rootID);

    if (!rawGraph) {
        await refreashGraph();
    }

    Display();
}

function refreashGraph() {
    return new Promise<void>((resolve) => {
        fetchSyncPost("api/graph/getGraph", {
            "conf": {
                "dailyNote": true,
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
                initRawGraph(result.data.nodes, result.data.links);
                resolve();
            }
        );
    });

}