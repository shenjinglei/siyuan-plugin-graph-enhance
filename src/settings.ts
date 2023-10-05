import { i18n, plugin, STORAGE_NAME } from "./utils";
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
        directionElement.add(new Option(i18n.settingDirLR, "LR"));
        directionElement.add(new Option(i18n.settingDirRL, "RL"));
        directionElement.add(new Option(i18n.settingDirTB, "TB"));
        directionElement.add(new Option(i18n.settingDirBT, "BT"));
        plugin.setting.addItem({
            title: i18n.settingDirTitle,
            createActionElement: () => {
                directionElement.value = plugin.data[STORAGE_NAME].rankdir;
                return directionElement;
            },
        });

        const algorithmElement = document.createElement("select");
        algorithmElement.id = "algorithm";
        algorithmElement.add(new Option(i18n.settingAlgNS, "network-simplex"));
        algorithmElement.add(new Option(i18n.settingAlgTT, "tight-tree"));
        algorithmElement.add(new Option(i18n.settingAlgLP, "longest-path"));
        plugin.setting.addItem({
            title: i18n.settingAlgTitle,
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
            title: i18n.settingBtnaTitle,
            actionElement: btnaElement,
        });
    }
}

export const pluginSetting: PluginSetting = new PluginSetting();