/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Display, initRawGraph, setGraphType, setIsHideDailynote, setSourceNode } from "./graph";
import { GRAPH_STATE_STORAGE_NAME, getHideDailyNotesFilter, getPersistedGraphViewMode, i18n, plugin, rawGraph, saveHideDailyNotesFilter, savePersistedGraphViewMode } from "./utils";
import { adaptHotkey, fetchSyncPost, getFrontend } from "siyuan";
import "./index.scss";
import { getSetting } from "./settings";
import { initEChart, resize } from "./renderer";
import { GRAPH_API_CONF } from "./constants";
import type { GraphType } from "./types";

const DOCK_TYPE = "dock_tab";
const GRAPH_BUTTON_IDS: Record<GraphType, string> = {
    global: "graph_enhance_global",
    ancestor: "graph_enhance_ancestor",
    brother: "graph_enhance_brother",
    cross: "graph_enhance_cross",
    neighbor: "graph_enhance_neighbor",
    path: "graph_enhance_path"
};

export function initDock() {
    const dockHtml = `<div class="fn__flex-1 fn__flex-column">
    <div class="block__icons">
        <div class="block__logo">
            <svg class="block__logoicon"><use xlink:href="#iconGraphEnhance"></use></svg>
            ${i18n.pluginName}
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span id="graph_enhance_dailynote" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnHideDN}"><svg id="graph_enhance_dailynote_icon" class="plugin-sample__dock-icon"><use xlink:href="#iconCalendar"></use></svg></span>
        <span id="graph_enhance_path" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnPath}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconCode"></use></svg></span>
        <span id="graph_enhance_global" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnGlobal}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconLanguage"></use></svg></span>
        <span id="graph_enhance_neighbor" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnNeighbor}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconWorkspace"></use></svg></span>
        <span id="graph_enhance_cross" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnCross}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconFocus"></use></svg></span>
        <span id="graph_enhance_ancestor" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnAncestor}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconGraph"></use></svg></span>
        <span id="graph_enhance_brother" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnBrother}"><svg class="plugin-sample__dock-icon"><use xlink:href="#iconGlobalGraph"></use></svg></span>
        <span id="graph_enhance_refresh" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnRefresh}"><svg><use xlink:href="#iconRefresh"></use></svg></span>
        <span id="graph_enhance_fullscreen" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${i18n.dockBtnFullscreen}"><svg><use xlink:href="#iconFullscreen"></use></svg></span>
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
            hotkey: "⌥Q",
        },
        data: {
            text: "graph-enhance-hello-world"
        },
        type: DOCK_TYPE,
        init() {
            this.element.innerHTML = dockHtml;

            document.getElementById("graph_enhance_dailynote")!.onclick = async () => {
                applyDailyNoteState(!getHideDailyNotesFilter(), true);
                Display();
            };

            document.getElementById("graph_enhance_refresh")!.onclick = async () => {
                await refreshGraph();
                Display();
            };

            // Fullscreen functionality
            let isFullscreen = false;
            const fullscreenBtn = document.getElementById("graph_enhance_fullscreen")!;
            const dockElement = (this.element.closest(".dock") || this.element.closest("[data-type=\"dock\"]") || this.element) as HTMLElement;

            fullscreenBtn.onclick = () => {
                if (!isFullscreen) {
                    // Enter fullscreen
                    dockElement.style.position = "fixed";
                    dockElement.style.top = "0";
                    dockElement.style.left = "0";
                    dockElement.style.width = "100vw";
                    dockElement.style.height = "100vh";
                    dockElement.style.zIndex = "9999";
                    dockElement.style.backgroundColor = "var(--b3-theme-background)";
                    fullscreenBtn.setAttribute("aria-label", i18n.dockBtnExitFullscreen);
                    isFullscreen = true;
                } else {
                    // Exit fullscreen
                    dockElement.style.position = "";
                    dockElement.style.top = "";
                    dockElement.style.left = "";
                    dockElement.style.width = "";
                    dockElement.style.height = "";
                    dockElement.style.zIndex = "";
                    dockElement.style.backgroundColor = "";
                    fullscreenBtn.setAttribute("aria-label", i18n.dockBtnFullscreen);
                    isFullscreen = false;
                }
                // Trigger resize to adjust graph
                setTimeout(() => {
                    const container = document.getElementById("graph_enhance_container")!;
                    resize({
                        width: container.offsetWidth,
                        height: container.offsetHeight
                    });
                }, 100);
            };

            const handleGraphButton = (graphType: GraphType) => async () => {
                const curDocId = getDocId();
                if (curDocId) setSourceNode(curDocId);
                if (!rawGraph) await refreshGraph();
                setGraphType(graphType);
                applyGraphTypeState(graphType);
                savePersistedGraphViewMode(graphType);
                Display();
            };

            document.getElementById("graph_enhance_global")!.onclick = handleGraphButton("global");
            document.getElementById("graph_enhance_ancestor")!.onclick = handleGraphButton("ancestor");
            document.getElementById("graph_enhance_brother")!.onclick = handleGraphButton("brother");
            document.getElementById("graph_enhance_cross")!.onclick = handleGraphButton("cross");
            document.getElementById("graph_enhance_neighbor")!.onclick = handleGraphButton("neighbor");
            document.getElementById("graph_enhance_path")!.onclick = handleGraphButton("path");

            plugin.loadData(GRAPH_STATE_STORAGE_NAME).then(() => {
                const savedGraphType = getPersistedGraphViewMode();
                setGraphType(savedGraphType);
                applyGraphTypeState(savedGraphType);
                applyDailyNoteState(getHideDailyNotesFilter());
            });

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

    function applyDailyNoteState(isHidden: boolean, shouldPersist = false) {
        if (shouldPersist) {
            saveHideDailyNotesFilter(isHidden);
        }

        setIsHideDailynote(isHidden);

        if (isHidden) {
            document.getElementById("graph_enhance_dailynote")?.setAttribute("aria-label", i18n.dockBtnShowDN);
            toggleDockIconState("graph_enhance_dailynote_icon", false);
        } else {
            document.getElementById("graph_enhance_dailynote")?.setAttribute("aria-label", i18n.dockBtnHideDN);
            toggleDockIconState("graph_enhance_dailynote_icon", true);
        }
    }

    function applyGraphTypeState(activeGraphType: GraphType) {
        Object.entries(GRAPH_BUTTON_IDS).forEach(([graphType, elementId]) => {
            const icon = document.getElementById(elementId)?.querySelector("svg");
            icon?.classList.toggle("plugin-sample__dock-icon--active", graphType === activeGraphType);
        });
    }

    function toggleDockIconState(elementId: string, isActive: boolean) {
        document.getElementById(elementId)?.classList.toggle("plugin-sample__dock-icon--active", isActive);
    }
}


export async function autoFollow({ detail }: any) {

    if (!setSourceNode(detail.protyle.block.rootID))
        return;

    if (!rawGraph) await refreshGraph();
    Display();
}

async function refreshGraph(): Promise<void> {
    const result = await fetchSyncPost("api/graph/getGraph", GRAPH_API_CONF);
    initRawGraph(result.data.nodes, result.data.links);
}

function getDocId(): string | undefined {
    if (getFrontend() === "mobile" || getFrontend() === "browser-mobile") {
        return document.querySelector("#editor .protyle-content .protyle-background")?.getAttribute("data-node-id") ?? undefined;
    }
    return document.querySelector(".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background")?.getAttribute("data-node-id") ?? undefined;
}