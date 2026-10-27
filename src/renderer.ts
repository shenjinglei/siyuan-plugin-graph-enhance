import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
    GraphChart,
    GraphSeriesOption,
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";

echarts.use([
    GraphChart,
    CanvasRenderer
]);
type ECOption = ComposeOption<GraphSeriesOption>;

import { GraphOutput, PopoverTrigger } from "./types";
import { openTab } from "siyuan";
import { getThemeMode, plugin } from "./utils";
import { getSetting } from "./settings";
import { DEFAULT_POPOVER_DELAY_MS, HOVER_PREVIEW_HIDE_DELAY_MS, MAX_POPOVER_DELAY_MS } from "./constants";

const ColorJs = require("colorjs.io/dist/color.legacy.cjs").default;


export let aEChart: echarts.ECharts;
let keydownListenerAdded = false;
export function initEChart() {
    aEChart = echarts.init(document.getElementById("graph_enhance_container"));
    if (!keydownListenerAdded) {
        document.addEventListener("keydown", onPopoverKeydown);
        keydownListenerAdded = true;
    }
}

export function teardownRenderer() {
    if (keydownListenerAdded) {
        document.removeEventListener("keydown", onPopoverKeydown);
        keydownListenerAdded = false;
    }
    hoveredNode = undefined;
    cancelHoverPreview();
    hidePreview();
}

export function resize(param: { width: number, height: number }) {
    aEChart.resize(param);
}

const primaryColours = ["Tomato", "GoldenRod", "LimeGreen", "DarkTurquoise", "RoyalBlue", "Violet", "Crimson"];

interface Palette {
    [key: string]: string;
}

const palette: Palette = {};

function getColor(flag: number): string {
    const result = palette[flag];
    if (result !== undefined)
        return result;

    const colors: string[] = [];
    let mask = 1;
    for (let index = 0; index < 32; index++) {
        if ((flag & mask) !== 0) {
            colors.push(primaryColours[index % primaryColours.length]);
        }
        mask <<= 1;
    }

    let newColor = new ColorJs(colors[0] ?? "Violet");
    for (let i = 1; i < colors.length; i++) {
        newColor = newColor.mix(colors[i], 1 / (i + 1), { space: "srgb" });
    }

    palette[flag] = newColor.toString({ format: "hex" });

    return palette[flag];
}

function getNodeColor() {
    if (getThemeMode() === "dark") {
        return {
            start: "#ffa87c",
            normal: "#ffff7f",
            from: "#e6b4e8",
            to: "#6bff6b",
            separate: "#8ea3e8",
            brother: "#b33cb3"
        };
    } else {
        return {
            start: "#aa0000",
            normal: "#003cb4",
            from: "#16a7a7",
            to: "#008600",
            separate: "#aaaa00",
            brother: "#b33cb3"
        };
    }
}

/** Minimal shape of SiYuan's frontend BlockPanel used by the hover preview */
interface PreviewPanel {
    element?: HTMLElement;
    destroy: () => void;
}

function getBlockPanels(): PreviewPanel[] {
    return (window as unknown as { siyuan?: { blockPanels?: PreviewPanel[] } }).siyuan?.blockPanels ?? [];
}

let hoverPreviewTimer: ReturnType<typeof setTimeout> | undefined;
let hidePreviewTimer: ReturnType<typeof setTimeout> | undefined;
let previewPanel: PreviewPanel | undefined;
let previewNodeId: string | undefined;
let hoveredNode: { id: string, getRect: () => AnchorRect } | undefined;
let previewObserver: MutationObserver | undefined;

/** Screen-space rect of the hovered node (symbol + label) that the popover is anchored to */
export interface AnchorRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface ZrRect { x: number, y: number, width: number, height: number }
interface ZrElement {
    __hostTarget?: ZrElement;
    getBoundingRect?: () => ZrRect;
    getComputedTransform?: () => number[] | null | undefined;
    getTextContent?: () => ZrElement | undefined;
}

/**
 * Canvas-space rect of a zrender element. Uses the freshly computed transform rather than the cached
 * getPaintRect(), which goes stale after the chart is zoomed / panned or the node is dragged.
 */
function getElementRect(el: ZrElement | undefined): ZrRect | undefined {
    const local = el?.getBoundingRect?.();
    if (!local)
        return undefined;
    const m = el?.getComputedTransform?.();
    if (!m)
        return local;
    const xs: number[] = [];
    const ys: number[] = [];
    for (const [x, y] of [[local.x, local.y], [local.x + local.width, local.y],
        [local.x, local.y + local.height], [local.x + local.width, local.y + local.height]]) {
        xs.push(m[0] * x + m[2] * y + m[4]);
        ys.push(m[1] * x + m[3] * y + m[5]);
    }
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

/** Compute the on-screen rect covering the node symbol and its label, falling back to the mouse point */
function getNodeRect(params: echarts.ECElementEvent, mouseEvent: MouseEvent): AnchorRect {
    const fallback = { left: mouseEvent.clientX, top: mouseEvent.clientY, right: mouseEvent.clientX, bottom: mouseEvent.clientY };
    try {
        const target = (params.event as unknown as { target?: ZrElement } | undefined)?.target;
        const host = target?.__hostTarget ?? target;
        const rects = [host, host?.getTextContent?.()]
            .map(getElementRect)
            .filter((r): r is ZrRect => !!r && [r.x, r.y, r.width, r.height].every(Number.isFinite));
        const container = aEChart?.getDom()?.getBoundingClientRect();
        if (!rects.length || !container)
            return fallback;
        return {
            left: container.left + Math.min(...rects.map(r => r.x)),
            top: container.top + Math.min(...rects.map(r => r.y)),
            right: container.left + Math.max(...rects.map(r => r.x + r.width)),
            bottom: container.top + Math.max(...rects.map(r => r.y + r.height)),
        };
    } catch {
        return fallback;
    }
}

/** Mirrors SiYuan's getTopBarHeight */
function getTopBarHeight(): number {
    if (document.getElementById("sidebar"))
        return 0;
    return document.querySelector<HTMLElement>(".toolbar--settings")?.clientHeight
        || document.getElementById("toolbar")?.clientHeight
        || document.querySelector<HTMLElement>(".layout-tab-bar")?.clientHeight
        || 0;
}

/**
 * Place the popover right next to the anchor like SiYuan's positionBlockPanel does for block refs:
 * open below unless the content doesn't fit and there is more room above, and constrain the height
 * so the popover never covers the anchor.
 */
export function positionPanel(element: HTMLElement, rect: AnchorRect) {
    element.style.maxHeight = "";
    element.style.minHeight = "";
    const height = element.getBoundingClientRect().height;
    const topBarHeight = getTopBarHeight();
    const above = Math.max(0, rect.top - topBarHeight - 8);
    const below = Math.max(0, window.innerHeight - rect.bottom - 12);
    const openAbove = height > below && above > below;
    const availableHeight = Math.floor(openAbove ? Math.min(height, above) : below);
    const style = getComputedStyle(element);
    const extraHeight = style.boxSizing === "border-box" ? 0 :
        (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0) +
        (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    const maxHeight = Math.max(0, availableHeight - extraHeight);
    element.style.minHeight = Math.min(parseFloat(style.minHeight) || 0, maxHeight) + "px";
    element.style.maxHeight = maxHeight + "px";

    const finalRect = element.getBoundingClientRect();
    const top = openAbove ? rect.top - finalRect.height - 8 : rect.bottom + 4;
    element.style.top = Math.max(topBarHeight, top) + "px";
    const left = Math.min(rect.left, window.innerWidth - finalRect.width - 8);
    element.style.left = Math.max(0, left) + "px";
}

function disconnectPreviewObserver() {
    previewObserver?.disconnect();
    previewObserver = undefined;
}

function cancelHoverPreview() {
    if (hoverPreviewTimer !== undefined) {
        clearTimeout(hoverPreviewTimer);
        hoverPreviewTimer = undefined;
    }
}

function cancelHidePreview() {
    if (hidePreviewTimer !== undefined) {
        clearTimeout(hidePreviewTimer);
        hidePreviewTimer = undefined;
    }
}

function isPreviewAlive(panel: PreviewPanel | undefined): panel is PreviewPanel & { element: HTMLElement } {
    return !!panel?.element && getBlockPanels().includes(panel);
}

/** True when the mouse is over the preview popover or any nested popover opened from it */
function isPointerInPreview(): boolean {
    if (!isPreviewAlive(previewPanel))
        return false;
    const oid = previewPanel.element.getAttribute("data-oid");
    return getBlockPanels().some(item =>
        item.element
        && item.element.getAttribute("data-oid") === oid
        && item.element.matches(":hover"));
}

function hidePreview() {
    cancelHidePreview();
    disconnectPreviewObserver();
    const panel = previewPanel;
    previewPanel = undefined;
    previewNodeId = undefined;
    // Pinned popovers belong to the user now, keep them.
    if (isPreviewAlive(panel) && panel.element.getAttribute("data-pin") !== "true") {
        panel.destroy();
    }
}

function scheduleHidePreview() {
    cancelHoverPreview();
    if (!previewPanel)
        return;
    cancelHidePreview();
    hidePreviewTimer = setTimeout(() => {
        hidePreviewTimer = undefined;
        if (isPointerInPreview())
            return;
        hidePreview();
    }, HOVER_PREVIEW_HIDE_DELAY_MS);
}

function showPreview(id: string, rect: AnchorRect) {
    hidePreview();
    const before = new Set(getBlockPanels());
    plugin.addFloatLayer({
        refDefs: [{ refID: id }],
        x: rect.left,
        y: rect.bottom,
        isBacklink: false,
    });
    const panel = getBlockPanels().find(item => !before.has(item));
    if (!panel?.element)
        return;

    previewPanel = panel;
    previewNodeId = id;
    const element = panel.element;
    element.addEventListener("mouseenter", cancelHidePreview);
    element.addEventListener("mouseleave", scheduleHidePreview);

    // SiYuan positions x/y popovers without regard to the anchor once the content loads, then adds
    // "block__popover--open" synchronously. Re-position right after that, before the next paint.
    const reposition = () => {
        if (!element.classList.contains("block__popover--open"))
            return false;
        disconnectPreviewObserver();
        positionPanel(element, rect);
        return true;
    };
    if (!reposition() && typeof MutationObserver !== "undefined") {
        previewObserver = new MutationObserver(reposition);
        previewObserver.observe(element, { attributes: true, attributeFilter: ["class"] });
    }
}

function scheduleHoverPreview(params: echarts.ECElementEvent) {
    cancelHoverPreview();
    const id = (params.data as { id?: string } | undefined)?.id;
    const mouseEvent = params.event?.event as MouseEvent | undefined;
    // Resolve the anchor lazily: the chart may be zoomed / panned between hovering and showing.
    const getRect = () => getNodeRect(params, mouseEvent as MouseEvent);
    hoveredNode = id && mouseEvent ? { id, getRect } : undefined;

    if (id && id === previewNodeId && isPreviewAlive(previewPanel)) {
        cancelHidePreview();
        return;
    }

    const trigger = getSetting("popoverTrigger") as PopoverTrigger;
    if (trigger === "none")
        return;

    if (!id || !mouseEvent)
        return;

    if (trigger === "ctrl") {
        if (mouseEvent.ctrlKey || mouseEvent.metaKey)
            showPreview(id, getRect());
        return;
    }

    hoverPreviewTimer = setTimeout(() => {
        hoverPreviewTimer = undefined;
        showPreview(id, getRect());
    }, getPopoverDelay());
}

function leaveNode() {
    hoveredNode = undefined;
    scheduleHidePreview();
}

/** In "ctrl" mode, pressing Ctrl/⌘ while already hovering a node also opens the popover */
function onPopoverKeydown(event: KeyboardEvent) {
    if (event.key !== "Control" && event.key !== "Meta")
        return;
    if (!hoveredNode || getSetting("popoverTrigger") !== "ctrl")
        return;
    if (hoveredNode.id === previewNodeId && isPreviewAlive(previewPanel))
        return;
    showPreview(hoveredNode.id, hoveredNode.getRect());
}

function getPopoverDelay(): number {
    const delay = parseInt(getSetting("popoverDelay"));
    if (Number.isNaN(delay) || delay < 0)
        return DEFAULT_POPOVER_DELAY_MS;
    return Math.min(delay, MAX_POPOVER_DELAY_MS);
}

export function draw(dagreLayout: GraphOutput) {
    hoveredNode = undefined;
    cancelHoverPreview();
    hidePreview();
    aEChart.clear();
    aEChart.off("click");
    aEChart.off("mouseover");
    aEChart.off("mouseout");
    aEChart.off("globalout");
    aEChart.off("graphroam");
    aEChart.off("mousedown");

    const color = getNodeColor();
    const font = getSetting("font");
    const fontSize = parseInt(getSetting("fontSize"));

    const option: ECOption = {
        tooltip: {},
        animation: dagreLayout.nodes.length > 100 ? false : true,
        series: [
            {
                name: "graph",
                type: "graph",
                layout: "none",
                edgeSymbol: ["none", "arrow"],
                draggable: true,
                roam: true,
                label: {
                    show: true,
                    position: "bottom",
                },
                data: dagreLayout.nodes.filter(x => x.value.label).map(x => {
                    return {
                        id: x.v,
                        name: x.value.label,
                        x: x.value.x,
                        y: x.value.y,
                        symbol: "circle",
                        symbolSize: 5,
                        itemStyle: {
                            color: color[x.value.color ?? "normal"]
                            //color: this.getColor(x.value.branch)
                        },
                        label: {
                            color: "inherit",
                            fontFamily: font,
                            fontSize: fontSize,
                            width: x.value.label.length > 16 ? 160 : undefined,
                            overflow: "break",
                        }
                    };
                }),
                links: dagreLayout.edges.map((edge) => {
                    const branch = edge.value.branch ?? 0;
                    return {
                        source: edge.v,
                        target: edge.w,
                        value: branch,
                        label: { show: false, formatter: "{c}" },
                        lineStyle: { color: getColor(branch) },
                    };
                }),
            },
        ],
    };

    aEChart.setOption(option);
    aEChart.on("click", { dataType: "node" }, function (params: echarts.ECElementEvent) {
        hoveredNode = undefined;
        cancelHoverPreview();
        hidePreview();
        // @ts-ignore
        openTab({ app: plugin.app, doc: { id: params.data.id, action: ["cb-get-focus"] } });
    });
    aEChart.on("mouseover", { dataType: "node" }, scheduleHoverPreview);
    aEChart.on("mouseout", { dataType: "node" }, leaveNode);
    aEChart.on("globalout", leaveNode);
    // The popover is anchored to the node's screen position; drop it once that position changes.
    aEChart.on("graphroam", dismissPreview);
    aEChart.on("mousedown", { dataType: "node" }, dismissPreview);
}

function dismissPreview() {
    cancelHoverPreview();
    hidePreview();
}
