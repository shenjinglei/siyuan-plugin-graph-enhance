import { plugin, STORAGE_NAME } from "./utils";
import {
    Setting
} from "siyuan";

class PluginSetting {
    public getSetting(settingName: string) {
        return plugin.data[STORAGE_NAME][settingName];
    }

    public init() {
        plugin.data[STORAGE_NAME] = { rankdir: "LR", ranker: "longest-path" };

        plugin.setting = new Setting({
            confirmCallback: () => {
                plugin.saveData(STORAGE_NAME,
                    {
                        rankdir: directionElement.options[directionElement.selectedIndex].value,
                        ranker: algorithmElement.options[algorithmElement.selectedIndex].value
                    });
            }
        });

        const directionElement = document.createElement("select");
        directionElement.id = "direction";
        directionElement.add(new Option("Left -> Right", "LR"));
        directionElement.add(new Option("Right -> Left", "RL"));
        directionElement.add(new Option("Top -> Bottom", "TB"));
        directionElement.add(new Option("Bottom -> Top", "BT"));
        plugin.setting.addItem({
            title: "布局方向",
            createActionElement: () => {
                directionElement.value = plugin.data[STORAGE_NAME].rankdir;
                return directionElement;
            },
        });

        const algorithmElement = document.createElement("select");
        algorithmElement.id = "algorithm";
        algorithmElement.add(new Option("network-simplex", "network-simplex"));
        algorithmElement.add(new Option("tight-tree", "tight-tree"));
        algorithmElement.add(new Option("longest-path", "longest-path"));
        plugin.setting.addItem({
            title: "布局算法",
            createActionElement: () => {
                algorithmElement.value = plugin.data[STORAGE_NAME].ranker;
                return algorithmElement;
            },
        });

        const btnaElement = document.createElement("button");
        btnaElement.className = "b3-button b3-button--outline fn__flex-center fn__size200";
        btnaElement.textContent = "Open";
        btnaElement.addEventListener("click", () => {
            window.open("https://github.com/shenjinglei/siyuan-plugin-graph-enhance");
        });
        plugin.setting.addItem({
            title: "Open plugin url",
            description: "Open plugin url in browser",
            actionElement: btnaElement,
        });
    }
}

export const pluginSetting: PluginSetting = new PluginSetting();