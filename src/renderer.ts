import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
    GraphChart,
    GraphSeriesOption,
} from "echarts/charts";
import type {
    ComposeOption,
} from "echarts/core";
import { TitleComponent, TitleComponentOption } from "echarts/components";

echarts.use([
    GraphChart,
    CanvasRenderer,
    TitleComponent
]);
type ECOption = ComposeOption<GraphSeriesOption | TitleComponentOption>;

import { DagreOutput } from "./types";
import { openTab } from "siyuan";
import { plugin } from "./utils";
import { title } from "./graph";

const ColorJs = require("colorjs.io/dist/color.legacy.cjs").default;


export let aEChart: echarts.ECharts;
export function initEChart() {
    aEChart = echarts.init(document.getElementById("graph_enhance_container"));
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

export function draw(dagreLayout: DagreOutput) {
    aEChart.clear();
    aEChart.off("click");

    const color = getNodeColor();

    const option: ECOption = {
        title: {
            text: title(),
            textStyle: {
                fontSize: 16,
                fontWeight: "normal"
            }
        },
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
                            fontFamily: "OPPOSans",
                            width: x.value.label.length > 16 ? 160 : undefined,
                            overflow: "break",
                        }
                    };
                }),
                links: dagreLayout.edges.map((x: any) => {
                    return {
                        source: x.v, target: x.w, value: x.value.branch,
                        label: { show: false, formatter: "{c}" },
                        lineStyle: { color: getColor(x.value.branch) }
                    };
                }),
            },
        ],
    };

    aEChart.setOption(option);
    aEChart.on("click", { dataType: "node" }, function (params: echarts.ECElementEvent) {
        // @ts-ignore
        openTab({ app: plugin.app, doc: { id: params.data.id, action: ["cb-get-focus"] } });
    });
}

function getThemeMode() {
    return document.querySelector("html")?.getAttribute("data-theme-mode");
}