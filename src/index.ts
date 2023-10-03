import {
    Plugin,
    adaptHotkey,
    getFrontend,
    getBackend,
    Setting
} from "siyuan";
import "./index.scss";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
    GraphChart,
    GraphSeriesOption,
} from "echarts/charts";

echarts.use([
    GraphChart,
    CanvasRenderer
]);

import type {
    ComposeOption,
} from "echarts/core";

type ECOption = ComposeOption<
    | GraphSeriesOption
>;

let myChart: echarts.ECharts;

const STORAGE_NAME = "graph-enhance-config";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {
    onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconM",
                title: "Custom Dock",
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
            Custom Dock
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
    </div>
    <div class="fn__flex-1 plugin-sample__custom-dock">
        <div id="graph_enhance_container">hello</div>
    </div>
</div>`;
                myChart = echarts.init(document.getElementById("graph_enhance_container"));

                console.log(myChart);

                const dagreLayout = {
                    "options": {
                        "directed": true,
                        "multigraph": false,
                        "compound": false
                    },
                    "nodes": [
                        {
                            "v": "20200812220555-lj3enxa",
                            "value": {
                                "label": "请从这里开始",
                                "width": 200,
                                "height": 10,
                                "x": 100,
                                "y": 225
                            }
                        },
                        {
                            "v": "20200813004931-q4cu8na",
                            "value": {
                                "label": "什么是内容块",
                                "width": 200,
                                "height": 10,
                                "x": 850,
                                "y": 125
                            }
                        },
                        {
                            "v": "20200813131152-0wk5akh",
                            "value": {
                                "label": "在内容块中遨游",
                                "width": 200,
                                "height": 10,
                                "x": 1100,
                                "y": 25
                            }
                        },
                        {
                            "v": "20200822191536-rm6hwid",
                            "value": {
                                "label": "窗口和页签",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 215
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "value": {
                                "label": "常见问题",
                                "width": 200,
                                "height": 10,
                                "x": 350,
                                "y": 535
                            }
                        },
                        {
                            "v": "20230428153709-hioyy5l",
                            "value": {
                                "label": "社区资源",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 1125
                            }
                        },
                        {
                            "v": "20200813013559-sgbzl5k",
                            "value": {
                                "label": "引用内容块",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 55
                            }
                        },
                        {
                            "v": "20201117101902-2ewjjum",
                            "value": {
                                "label": "嵌入内容块",
                                "width": 200,
                                "height": 10,
                                "x": 1100,
                                "y": 155
                            }
                        },
                        {
                            "v": "20200905090211-2vixtlf",
                            "value": {
                                "label": "内容块类型",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 85
                            }
                        },
                        {
                            "v": "20211010211311-ffz0wbu",
                            "value": {
                                "label": "虚拟引用",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 5
                            }
                        },
                        {
                            "v": "20201004184819-nj8ibyg",
                            "value": {
                                "label": "在浏览器上使用",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 215
                            }
                        },
                        {
                            "v": "20200915214115-42b8zma",
                            "value": {
                                "label": "资源文件",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 465
                            }
                        },
                        {
                            "v": "20210615211733-v6rzowm",
                            "value": {
                                "label": "数据历史",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 595
                            }
                        },
                        {
                            "v": "20201204181006-7bkppue",
                            "value": {
                                "label": "模板片段",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 275
                            }
                        },
                        {
                            "v": "20210824201257-cy7icrc",
                            "value": {
                                "label": "挂件",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 385
                            }
                        },
                        {
                            "v": "20230104144904-39br4c6",
                            "value": {
                                "label": "分享文档",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 335
                            }
                        },
                        {
                            "v": "20230106101434-e6g4av3",
                            "value": {
                                "label": "工作空间",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 705
                            }
                        },
                        {
                            "v": "20221223215557-o6gfsoy",
                            "value": {
                                "label": "闪卡",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 525
                            }
                        },
                        {
                            "v": "20230506210010-houyyvy",
                            "value": {
                                "label": "插件",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 395
                            }
                        },
                        {
                            "v": "20230805230131-sn7obzb",
                            "value": {
                                "label": "对接第三方云端存储",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 765
                            }
                        },
                        {
                            "v": "20230805222417-2lj3dvk",
                            "value": {
                                "label": "会员特权",
                                "width": 200,
                                "height": 10,
                                "x": 600,
                                "y": 905
                            }
                        },
                        {
                            "v": "20201222093044-rx4zjoy",
                            "value": {
                                "label": "数据库表",
                                "width": 200,
                                "height": 10,
                                "x": 1350,
                                "y": 155
                            }
                        },
                        {
                            "v": "20220628204444-9n0y9h2",
                            "value": {
                                "label": "优化排版",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 585
                            }
                        },
                        {
                            "v": "20230808120347-3cob0nb",
                            "value": {
                                "label": "数据同步",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 645
                            }
                        },
                        {
                            "v": "20230808120347-pzvmkik",
                            "value": {
                                "label": "存储空间",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 765
                            }
                        },
                        {
                            "v": "20230805225107-qm1m2f5",
                            "value": {
                                "label": "功能特性",
                                "width": 200,
                                "height": 10,
                                "x": 1100,
                                "y": 825
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "value": {
                                "label": "云端服务",
                                "width": 200,
                                "height": 10,
                                "x": 850,
                                "y": 935
                            }
                        },
                        {
                            "v": "20201222095049-hghafhe",
                            "value": {
                                "label": "类型过滤",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 155
                            }
                        },
                        {
                            "v": "20230805230218-aea8icj",
                            "value": {
                                "label": "搜索资源文件内容",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 825
                            }
                        },
                        {
                            "v": "20230808120348-hynr7og",
                            "value": {
                                "label": "收集箱",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 885
                            }
                        },
                        {
                            "v": "20230808120348-vaxi6eq",
                            "value": {
                                "label": "微信提醒",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 945
                            }
                        },
                        {
                            "v": "20230808120348-lgcp9zm",
                            "value": {
                                "label": "数据备份",
                                "width": 200,
                                "height": 10,
                                "x": 1100,
                                "y": 575
                            }
                        },
                        {
                            "v": "20230808120347-mw3qrwy",
                            "value": {
                                "label": "资源文件图床",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 1005
                            }
                        },
                        {
                            "v": "20230808120348-yut741f",
                            "value": {
                                "label": "限制",
                                "width": 200,
                                "height": 10,
                                "x": 1600,
                                "y": 1065
                            }
                        }
                    ],
                    "edges": [
                        {
                            "v": "20200812220555-lj3enxa",
                            "w": "20200813004931-q4cu8na",
                            "value": {
                                "points": [
                                    {
                                        "x": 106.25,
                                        "y": 220
                                    },
                                    {
                                        "x": 225,
                                        "y": 125
                                    },
                                    {
                                        "x": 350,
                                        "y": 125
                                    },
                                    {
                                        "x": 475,
                                        "y": 125
                                    },
                                    {
                                        "x": 600,
                                        "y": 125
                                    },
                                    {
                                        "x": 725,
                                        "y": 125
                                    },
                                    {
                                        "x": 750,
                                        "y": 125
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200812220555-lj3enxa",
                            "w": "20200813131152-0wk5akh",
                            "value": {
                                "points": [
                                    {
                                        "x": 103.47222222222223,
                                        "y": 220
                                    },
                                    {
                                        "x": 225,
                                        "y": 45
                                    },
                                    {
                                        "x": 350,
                                        "y": 45
                                    },
                                    {
                                        "x": 475,
                                        "y": 45
                                    },
                                    {
                                        "x": 600,
                                        "y": 45
                                    },
                                    {
                                        "x": 725,
                                        "y": 45
                                    },
                                    {
                                        "x": 850,
                                        "y": 45
                                    },
                                    {
                                        "x": 975,
                                        "y": 45
                                    },
                                    {
                                        "x": 1068.75,
                                        "y": 30
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200812220555-lj3enxa",
                            "w": "20200822191536-rm6hwid",
                            "value": {
                                "points": [
                                    {
                                        "x": 162.5,
                                        "y": 220
                                    },
                                    {
                                        "x": 225,
                                        "y": 215
                                    },
                                    {
                                        "x": 350,
                                        "y": 215
                                    },
                                    {
                                        "x": 475,
                                        "y": 215
                                    },
                                    {
                                        "x": 600,
                                        "y": 215
                                    },
                                    {
                                        "x": 725,
                                        "y": 215
                                    },
                                    {
                                        "x": 850,
                                        "y": 215
                                    },
                                    {
                                        "x": 975,
                                        "y": 215
                                    },
                                    {
                                        "x": 1100,
                                        "y": 215
                                    },
                                    {
                                        "x": 1225,
                                        "y": 215
                                    },
                                    {
                                        "x": 1250,
                                        "y": 215
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200812220555-lj3enxa",
                            "w": "20200813093015-u6bopdt",
                            "value": {
                                "points": [
                                    {
                                        "x": 102.01612903225806,
                                        "y": 230
                                    },
                                    {
                                        "x": 225,
                                        "y": 535
                                    },
                                    {
                                        "x": 250,
                                        "y": 535
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200812220555-lj3enxa",
                            "w": "20230428153709-hioyy5l",
                            "value": {
                                "points": [
                                    {
                                        "x": 100.69444444444444,
                                        "y": 230
                                    },
                                    {
                                        "x": 225,
                                        "y": 1125
                                    },
                                    {
                                        "x": 350,
                                        "y": 1125
                                    },
                                    {
                                        "x": 475,
                                        "y": 1125
                                    },
                                    {
                                        "x": 600,
                                        "y": 1125
                                    },
                                    {
                                        "x": 725,
                                        "y": 1125
                                    },
                                    {
                                        "x": 850,
                                        "y": 1125
                                    },
                                    {
                                        "x": 975,
                                        "y": 1125
                                    },
                                    {
                                        "x": 1100,
                                        "y": 1125
                                    },
                                    {
                                        "x": 1225,
                                        "y": 1125
                                    },
                                    {
                                        "x": 1350,
                                        "y": 1125
                                    },
                                    {
                                        "x": 1475,
                                        "y": 1125
                                    },
                                    {
                                        "x": 1500,
                                        "y": 1125
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813004931-q4cu8na",
                            "w": "20200813131152-0wk5akh",
                            "value": {
                                "points": [
                                    {
                                        "x": 855.6818181818181,
                                        "y": 120
                                    },
                                    {
                                        "x": 975,
                                        "y": 15
                                    },
                                    {
                                        "x": 1037.5,
                                        "y": 20
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813004931-q4cu8na",
                            "w": "20200813013559-sgbzl5k",
                            "value": {
                                "points": [
                                    {
                                        "x": 865.625,
                                        "y": 120
                                    },
                                    {
                                        "x": 975,
                                        "y": 85
                                    },
                                    {
                                        "x": 1100,
                                        "y": 85
                                    },
                                    {
                                        "x": 1225,
                                        "y": 85
                                    },
                                    {
                                        "x": 1329.1666666666667,
                                        "y": 60
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813004931-q4cu8na",
                            "w": "20201117101902-2ewjjum",
                            "value": {
                                "points": [
                                    {
                                        "x": 870.8333333333334,
                                        "y": 130
                                    },
                                    {
                                        "x": 975,
                                        "y": 155
                                    },
                                    {
                                        "x": 1000,
                                        "y": 155
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813004931-q4cu8na",
                            "w": "20200905090211-2vixtlf",
                            "value": {
                                "points": [
                                    {
                                        "x": 881.25,
                                        "y": 120
                                    },
                                    {
                                        "x": 975,
                                        "y": 105
                                    },
                                    {
                                        "x": 1100,
                                        "y": 105
                                    },
                                    {
                                        "x": 1225,
                                        "y": 105
                                    },
                                    {
                                        "x": 1350,
                                        "y": 105
                                    },
                                    {
                                        "x": 1475,
                                        "y": 105
                                    },
                                    {
                                        "x": 1568.75,
                                        "y": 90
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813131152-0wk5akh",
                            "w": "20200813013559-sgbzl5k",
                            "value": {
                                "points": [
                                    {
                                        "x": 1120.8333333333333,
                                        "y": 30
                                    },
                                    {
                                        "x": 1225,
                                        "y": 55
                                    },
                                    {
                                        "x": 1250,
                                        "y": 55
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813131152-0wk5akh",
                            "w": "20211010211311-ffz0wbu",
                            "value": {
                                "points": [
                                    {
                                        "x": 1131.25,
                                        "y": 20
                                    },
                                    {
                                        "x": 1225,
                                        "y": 5
                                    },
                                    {
                                        "x": 1350,
                                        "y": 5
                                    },
                                    {
                                        "x": 1475,
                                        "y": 5
                                    },
                                    {
                                        "x": 1500,
                                        "y": 5
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200822191536-rm6hwid",
                            "w": "20201004184819-nj8ibyg",
                            "value": {
                                "points": [
                                    {
                                        "x": 1450,
                                        "y": 215
                                    },
                                    {
                                        "x": 1475,
                                        "y": 215
                                    },
                                    {
                                        "x": 1500,
                                        "y": 215
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20200915214115-42b8zma",
                            "value": {
                                "points": [
                                    {
                                        "x": 362.5,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 485
                                    },
                                    {
                                        "x": 600,
                                        "y": 485
                                    },
                                    {
                                        "x": 725,
                                        "y": 485
                                    },
                                    {
                                        "x": 850,
                                        "y": 485
                                    },
                                    {
                                        "x": 975,
                                        "y": 485
                                    },
                                    {
                                        "x": 1100,
                                        "y": 485
                                    },
                                    {
                                        "x": 1225,
                                        "y": 485
                                    },
                                    {
                                        "x": 1350,
                                        "y": 485
                                    },
                                    {
                                        "x": 1475,
                                        "y": 485
                                    },
                                    {
                                        "x": 1568.75,
                                        "y": 470
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20210615211733-v6rzowm",
                            "value": {
                                "points": [
                                    {
                                        "x": 357.8125,
                                        "y": 540
                                    },
                                    {
                                        "x": 475,
                                        "y": 615
                                    },
                                    {
                                        "x": 600,
                                        "y": 615
                                    },
                                    {
                                        "x": 725,
                                        "y": 615
                                    },
                                    {
                                        "x": 850,
                                        "y": 615
                                    },
                                    {
                                        "x": 975,
                                        "y": 615
                                    },
                                    {
                                        "x": 1100,
                                        "y": 615
                                    },
                                    {
                                        "x": 1225,
                                        "y": 615
                                    },
                                    {
                                        "x": 1318.75,
                                        "y": 600
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20201204181006-7bkppue",
                            "value": {
                                "points": [
                                    {
                                        "x": 352.40384615384613,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 275
                                    },
                                    {
                                        "x": 600,
                                        "y": 275
                                    },
                                    {
                                        "x": 725,
                                        "y": 275
                                    },
                                    {
                                        "x": 850,
                                        "y": 275
                                    },
                                    {
                                        "x": 975,
                                        "y": 275
                                    },
                                    {
                                        "x": 1100,
                                        "y": 275
                                    },
                                    {
                                        "x": 1225,
                                        "y": 275
                                    },
                                    {
                                        "x": 1350,
                                        "y": 275
                                    },
                                    {
                                        "x": 1475,
                                        "y": 275
                                    },
                                    {
                                        "x": 1500,
                                        "y": 275
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20210824201257-cy7icrc",
                            "value": {
                                "points": [
                                    {
                                        "x": 354.1666666666667,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 385
                                    },
                                    {
                                        "x": 600,
                                        "y": 385
                                    },
                                    {
                                        "x": 725,
                                        "y": 385
                                    },
                                    {
                                        "x": 850,
                                        "y": 385
                                    },
                                    {
                                        "x": 975,
                                        "y": 385
                                    },
                                    {
                                        "x": 1100,
                                        "y": 385
                                    },
                                    {
                                        "x": 1225,
                                        "y": 385
                                    },
                                    {
                                        "x": 1250,
                                        "y": 385
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20230104144904-39br4c6",
                            "value": {
                                "points": [
                                    {
                                        "x": 353.125,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 335
                                    },
                                    {
                                        "x": 600,
                                        "y": 335
                                    },
                                    {
                                        "x": 725,
                                        "y": 335
                                    },
                                    {
                                        "x": 850,
                                        "y": 335
                                    },
                                    {
                                        "x": 975,
                                        "y": 335
                                    },
                                    {
                                        "x": 1100,
                                        "y": 335
                                    },
                                    {
                                        "x": 1225,
                                        "y": 335
                                    },
                                    {
                                        "x": 1350,
                                        "y": 335
                                    },
                                    {
                                        "x": 1475,
                                        "y": 335
                                    },
                                    {
                                        "x": 1500,
                                        "y": 335
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20230106101434-e6g4av3",
                            "value": {
                                "points": [
                                    {
                                        "x": 353.47222222222223,
                                        "y": 540
                                    },
                                    {
                                        "x": 475,
                                        "y": 715
                                    },
                                    {
                                        "x": 600,
                                        "y": 715
                                    },
                                    {
                                        "x": 725,
                                        "y": 715
                                    },
                                    {
                                        "x": 850,
                                        "y": 715
                                    },
                                    {
                                        "x": 975,
                                        "y": 715
                                    },
                                    {
                                        "x": 1100,
                                        "y": 715
                                    },
                                    {
                                        "x": 1225,
                                        "y": 715
                                    },
                                    {
                                        "x": 1350,
                                        "y": 715
                                    },
                                    {
                                        "x": 1475,
                                        "y": 715
                                    },
                                    {
                                        "x": 1537.5,
                                        "y": 710
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20221223215557-o6gfsoy",
                            "value": {
                                "points": [
                                    {
                                        "x": 412.5,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 525
                                    },
                                    {
                                        "x": 600,
                                        "y": 525
                                    },
                                    {
                                        "x": 725,
                                        "y": 525
                                    },
                                    {
                                        "x": 850,
                                        "y": 525
                                    },
                                    {
                                        "x": 975,
                                        "y": 525
                                    },
                                    {
                                        "x": 1100,
                                        "y": 525
                                    },
                                    {
                                        "x": 1225,
                                        "y": 525
                                    },
                                    {
                                        "x": 1350,
                                        "y": 525
                                    },
                                    {
                                        "x": 1475,
                                        "y": 525
                                    },
                                    {
                                        "x": 1500,
                                        "y": 525
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20230506210010-houyyvy",
                            "value": {
                                "points": [
                                    {
                                        "x": 356.25,
                                        "y": 530
                                    },
                                    {
                                        "x": 475,
                                        "y": 435
                                    },
                                    {
                                        "x": 600,
                                        "y": 435
                                    },
                                    {
                                        "x": 725,
                                        "y": 435
                                    },
                                    {
                                        "x": 850,
                                        "y": 435
                                    },
                                    {
                                        "x": 975,
                                        "y": 435
                                    },
                                    {
                                        "x": 1100,
                                        "y": 435
                                    },
                                    {
                                        "x": 1225,
                                        "y": 435
                                    },
                                    {
                                        "x": 1350,
                                        "y": 435
                                    },
                                    {
                                        "x": 1475,
                                        "y": 435
                                    },
                                    {
                                        "x": 1584.375,
                                        "y": 400
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20230805230131-sn7obzb",
                            "value": {
                                "points": [
                                    {
                                        "x": 352.6041666666667,
                                        "y": 540
                                    },
                                    {
                                        "x": 475,
                                        "y": 775
                                    },
                                    {
                                        "x": 600,
                                        "y": 775
                                    },
                                    {
                                        "x": 725,
                                        "y": 775
                                    },
                                    {
                                        "x": 850,
                                        "y": 775
                                    },
                                    {
                                        "x": 975,
                                        "y": 775
                                    },
                                    {
                                        "x": 1100,
                                        "y": 775
                                    },
                                    {
                                        "x": 1225,
                                        "y": 775
                                    },
                                    {
                                        "x": 1287.5,
                                        "y": 770
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813093015-u6bopdt",
                            "w": "20230805222417-2lj3dvk",
                            "value": {
                                "points": [
                                    {
                                        "x": 351.68918918918916,
                                        "y": 540
                                    },
                                    {
                                        "x": 475,
                                        "y": 905
                                    },
                                    {
                                        "x": 500,
                                        "y": 905
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813013559-sgbzl5k",
                            "w": "20200813131152-0wk5akh",
                            "value": {
                                "points": [
                                    {
                                        "x": 1318.75,
                                        "y": 50
                                    },
                                    {
                                        "x": 1225,
                                        "y": 35
                                    },
                                    {
                                        "x": 1162.5,
                                        "y": 30
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20200813013559-sgbzl5k",
                            "w": "20200905090211-2vixtlf",
                            "value": {
                                "points": [
                                    {
                                        "x": 1450,
                                        "y": 55
                                    },
                                    {
                                        "x": 1475,
                                        "y": 55
                                    },
                                    {
                                        "x": 1579.1666666666667,
                                        "y": 80
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20201117101902-2ewjjum",
                            "w": "20201222093044-rx4zjoy",
                            "value": {
                                "points": [
                                    {
                                        "x": 1200,
                                        "y": 155
                                    },
                                    {
                                        "x": 1225,
                                        "y": 155
                                    },
                                    {
                                        "x": 1250,
                                        "y": 155
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20210615211733-v6rzowm",
                            "w": "20220628204444-9n0y9h2",
                            "value": {
                                "points": [
                                    {
                                        "x": 1450,
                                        "y": 595
                                    },
                                    {
                                        "x": 1475,
                                        "y": 595
                                    },
                                    {
                                        "x": 1537.5,
                                        "y": 590
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20210615211733-v6rzowm",
                            "w": "20200915214115-42b8zma",
                            "value": {
                                "points": [
                                    {
                                        "x": 1354.4642857142858,
                                        "y": 590
                                    },
                                    {
                                        "x": 1475,
                                        "y": 455
                                    },
                                    {
                                        "x": 1537.5,
                                        "y": 460
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20210615211733-v6rzowm",
                            "w": "20230808120347-3cob0nb",
                            "value": {
                                "points": [
                                    {
                                        "x": 1357.8125,
                                        "y": 600
                                    },
                                    {
                                        "x": 1475,
                                        "y": 675
                                    },
                                    {
                                        "x": 1579.1666666666667,
                                        "y": 650
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20210824201257-cy7icrc",
                            "w": "20230506210010-houyyvy",
                            "value": {
                                "points": [
                                    {
                                        "x": 1412.5,
                                        "y": 390
                                    },
                                    {
                                        "x": 1475,
                                        "y": 395
                                    },
                                    {
                                        "x": 1500,
                                        "y": 395
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230106101434-e6g4av3",
                            "w": "20200813093015-u6bopdt",
                            "value": {
                                "points": [
                                    {
                                        "x": 1537.5,
                                        "y": 700
                                    },
                                    {
                                        "x": 1475,
                                        "y": 695
                                    },
                                    {
                                        "x": 1350,
                                        "y": 695
                                    },
                                    {
                                        "x": 1225,
                                        "y": 695
                                    },
                                    {
                                        "x": 1100,
                                        "y": 695
                                    },
                                    {
                                        "x": 975,
                                        "y": 695
                                    },
                                    {
                                        "x": 850,
                                        "y": 695
                                    },
                                    {
                                        "x": 725,
                                        "y": 695
                                    },
                                    {
                                        "x": 600,
                                        "y": 695
                                    },
                                    {
                                        "x": 475,
                                        "y": 695
                                    },
                                    {
                                        "x": 353.90625,
                                        "y": 540
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230506210010-houyyvy",
                            "w": "20210824201257-cy7icrc",
                            "value": {
                                "points": [
                                    {
                                        "x": 1579.1666666666667,
                                        "y": 390
                                    },
                                    {
                                        "x": 1475,
                                        "y": 365
                                    },
                                    {
                                        "x": 1381.25,
                                        "y": 380
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230805230131-sn7obzb",
                            "w": "20230808120347-pzvmkik",
                            "value": {
                                "points": [
                                    {
                                        "x": 1450,
                                        "y": 765
                                    },
                                    {
                                        "x": 1475,
                                        "y": 765
                                    },
                                    {
                                        "x": 1500,
                                        "y": 765
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230805222417-2lj3dvk",
                            "w": "20230805225107-qm1m2f5",
                            "value": {
                                "points": [
                                    {
                                        "x": 607.8125,
                                        "y": 900
                                    },
                                    {
                                        "x": 725,
                                        "y": 825
                                    },
                                    {
                                        "x": 850,
                                        "y": 825
                                    },
                                    {
                                        "x": 975,
                                        "y": 825
                                    },
                                    {
                                        "x": 1000,
                                        "y": 825
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230805222417-2lj3dvk",
                            "w": "20230808120348-orm8sjf",
                            "value": {
                                "points": [
                                    {
                                        "x": 620.8333333333334,
                                        "y": 910
                                    },
                                    {
                                        "x": 725,
                                        "y": 935
                                    },
                                    {
                                        "x": 750,
                                        "y": 935
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20201222093044-rx4zjoy",
                            "w": "20201222095049-hghafhe",
                            "value": {
                                "points": [
                                    {
                                        "x": 1450,
                                        "y": 155
                                    },
                                    {
                                        "x": 1475,
                                        "y": 155
                                    },
                                    {
                                        "x": 1500,
                                        "y": 155
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20220628204444-9n0y9h2",
                            "w": "20210615211733-v6rzowm",
                            "value": {
                                "points": [
                                    {
                                        "x": 1568.75,
                                        "y": 580
                                    },
                                    {
                                        "x": 1475,
                                        "y": 565
                                    },
                                    {
                                        "x": 1370.8333333333333,
                                        "y": 590
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120347-3cob0nb",
                            "w": "20210615211733-v6rzowm",
                            "value": {
                                "points": [
                                    {
                                        "x": 1579.1666666666667,
                                        "y": 640
                                    },
                                    {
                                        "x": 1475,
                                        "y": 615
                                    },
                                    {
                                        "x": 1381.25,
                                        "y": 600
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230805225107-qm1m2f5",
                            "w": "20230805230218-aea8icj",
                            "value": {
                                "points": [
                                    {
                                        "x": 1200,
                                        "y": 825
                                    },
                                    {
                                        "x": 1225,
                                        "y": 825
                                    },
                                    {
                                        "x": 1350,
                                        "y": 825
                                    },
                                    {
                                        "x": 1475,
                                        "y": 825
                                    },
                                    {
                                        "x": 1500,
                                        "y": 825
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230805225107-qm1m2f5",
                            "w": "20230805230131-sn7obzb",
                            "value": {
                                "points": [
                                    {
                                        "x": 1107.8125,
                                        "y": 820
                                    },
                                    {
                                        "x": 1225,
                                        "y": 745
                                    },
                                    {
                                        "x": 1318.75,
                                        "y": 760
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120347-3cob0nb",
                            "value": {
                                "points": [
                                    {
                                        "x": 852.1551724137931,
                                        "y": 930
                                    },
                                    {
                                        "x": 975,
                                        "y": 645
                                    },
                                    {
                                        "x": 1100,
                                        "y": 645
                                    },
                                    {
                                        "x": 1225,
                                        "y": 645
                                    },
                                    {
                                        "x": 1350,
                                        "y": 645
                                    },
                                    {
                                        "x": 1475,
                                        "y": 645
                                    },
                                    {
                                        "x": 1500,
                                        "y": 645
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120348-hynr7og",
                            "value": {
                                "points": [
                                    {
                                        "x": 862.5,
                                        "y": 930
                                    },
                                    {
                                        "x": 975,
                                        "y": 885
                                    },
                                    {
                                        "x": 1100,
                                        "y": 885
                                    },
                                    {
                                        "x": 1225,
                                        "y": 885
                                    },
                                    {
                                        "x": 1350,
                                        "y": 885
                                    },
                                    {
                                        "x": 1475,
                                        "y": 885
                                    },
                                    {
                                        "x": 1500,
                                        "y": 885
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120348-vaxi6eq",
                            "value": {
                                "points": [
                                    {
                                        "x": 912.5,
                                        "y": 940
                                    },
                                    {
                                        "x": 975,
                                        "y": 945
                                    },
                                    {
                                        "x": 1100,
                                        "y": 945
                                    },
                                    {
                                        "x": 1225,
                                        "y": 945
                                    },
                                    {
                                        "x": 1350,
                                        "y": 945
                                    },
                                    {
                                        "x": 1475,
                                        "y": 945
                                    },
                                    {
                                        "x": 1500,
                                        "y": 945
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120348-lgcp9zm",
                            "value": {
                                "points": [
                                    {
                                        "x": 851.7361111111111,
                                        "y": 930
                                    },
                                    {
                                        "x": 975,
                                        "y": 575
                                    },
                                    {
                                        "x": 1000,
                                        "y": 575
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120347-mw3qrwy",
                            "value": {
                                "points": [
                                    {
                                        "x": 858.9285714285714,
                                        "y": 940
                                    },
                                    {
                                        "x": 975,
                                        "y": 1005
                                    },
                                    {
                                        "x": 1100,
                                        "y": 1005
                                    },
                                    {
                                        "x": 1225,
                                        "y": 1005
                                    },
                                    {
                                        "x": 1350,
                                        "y": 1005
                                    },
                                    {
                                        "x": 1475,
                                        "y": 1005
                                    },
                                    {
                                        "x": 1500,
                                        "y": 1005
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-orm8sjf",
                            "w": "20230808120348-yut741f",
                            "value": {
                                "points": [
                                    {
                                        "x": 854.8076923076923,
                                        "y": 940
                                    },
                                    {
                                        "x": 975,
                                        "y": 1065
                                    },
                                    {
                                        "x": 1100,
                                        "y": 1065
                                    },
                                    {
                                        "x": 1225,
                                        "y": 1065
                                    },
                                    {
                                        "x": 1350,
                                        "y": 1065
                                    },
                                    {
                                        "x": 1475,
                                        "y": 1065
                                    },
                                    {
                                        "x": 1500,
                                        "y": 1065
                                    }
                                ]
                            }
                        },
                        {
                            "v": "20230808120348-lgcp9zm",
                            "w": "20210615211733-v6rzowm",
                            "value": {
                                "points": [
                                    {
                                        "x": 1200,
                                        "y": 575
                                    },
                                    {
                                        "x": 1225,
                                        "y": 575
                                    },
                                    {
                                        "x": 1318.75,
                                        "y": 590
                                    }
                                ]
                            }
                        }
                    ],
                    "value": {
                        "rankdir": "LR",
                        "ranker": "longest-path",
                        "width": 1700,
                        "height": 1130
                    }
                };

                console.log(dagreLayout);

                const option: ECOption = {
                    title: {
                        text: "Les Miserables",
                        subtext: "Default layout",
                        top: "bottom",
                        left: "right",
                    },
                    tooltip: {},
                    animationDuration: 1500,
                    animationEasingUpdate: "quinticInOut",
                    series: [
                        {
                            name: "Les Miserables",
                            type: "graph",
                            layout: "none",
                            edgeSymbol: ["none", "arrow"],
                            draggable: true,
                            roam: true,
                            label: {
                                show: true,
                            },
                            data: dagreLayout.nodes.map((x: any) => {
                                return { id: x.v, name: x.value.label, x: x.value.x, y: x.value.y };
                            }),
                            links: dagreLayout.edges.map((x: any) => {
                                return { source: x.v, target: x.w };
                            }),
                        },
                    ],
                };

                console.log(option);

                myChart.setOption(option);
            },
            destroy() {
                console.log("destroy dock:", DOCK_TYPE);
            }
        });





        const textareaElement = document.createElement("textarea");
        this.setting = new Setting({
            confirmCallback: () => {
                this.saveData(STORAGE_NAME, { readonlyText: textareaElement.value });
            }
        });
        this.setting.addItem({
            title: "Readonly text",
            createActionElement: () => {
                textareaElement.className = "b3-text-field fn__block";
                textareaElement.placeholder = "Readonly text in the menu";
                textareaElement.value = this.data[STORAGE_NAME].readonlyText;
                return textareaElement;
            },
        });
        const btnaElement = document.createElement("button");
        btnaElement.className = "b3-button b3-button--outline fn__flex-center fn__size200";
        btnaElement.textContent = "Open";
        btnaElement.addEventListener("click", () => {
            window.open("https://github.com/siyuan-note/plugin-sample");
        });
        this.setting.addItem({
            title: "Open plugin url",
            description: "Open plugin url in browser",
            actionElement: btnaElement,
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
}
