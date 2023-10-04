import { plugin, STORAGE_NAME } from "./utils";
import {
    Setting
} from "siyuan";

class PluginSetting {
    public init() {
        plugin.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        const textareaElement = document.createElement("textarea");
        plugin.setting = new Setting({
            confirmCallback: () => {
                plugin.saveData(STORAGE_NAME, { readonlyText: textareaElement.value });
            }
        });
        plugin.setting.addItem({
            title: "Readonly text",
            createActionElement: () => {
                textareaElement.className = "b3-text-field fn__block";
                textareaElement.placeholder = "Readonly text in the menu";
                textareaElement.value = plugin.data[STORAGE_NAME].readonlyText;
                return textareaElement;
            },
        });
        const btnaElement = document.createElement("button");
        btnaElement.className = "b3-button b3-button--outline fn__flex-center fn__size200";
        btnaElement.textContent = "Open";
        btnaElement.addEventListener("click", () => {
            window.open("https://github.com/siyuan-note/plugin-sample");
        });
        plugin.setting.addItem({
            title: "Open plugin url",
            description: "Open plugin url in browser",
            actionElement: btnaElement,
        });
    }
}

export const pluginSetting: PluginSetting = new PluginSetting();