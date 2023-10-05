import { plugin, STORAGE_NAME } from "./utils";
import {
    Setting
} from "siyuan";

class PluginSetting {
    public getSetting(settingName: string) {
        return plugin.data[STORAGE_NAME][settingName];
    }

    public init() {
        plugin.data[STORAGE_NAME] = { direction: "LR" };

        plugin.setting = new Setting({
            confirmCallback: () => {
                plugin.saveData(STORAGE_NAME,
                    {
                        direction: directionElement.options[directionElement.selectedIndex].value
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
            title: "Direction",
            createActionElement: () => {
                directionElement.value = plugin.data[STORAGE_NAME].direction;
                return directionElement;
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