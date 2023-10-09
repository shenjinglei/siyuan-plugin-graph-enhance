import { i18n, plugin, STORAGE_NAME } from "./utils";
import { Setting } from "siyuan";

class PluginSetting {
    public getSetting(settingName: string) {
        return plugin.data[STORAGE_NAME][settingName];
    }

    public init() {
        plugin.setting = new Setting({
            confirmCallback: () => {
                plugin.saveData(STORAGE_NAME,
                    {
                        rankdir: directionElement.options[directionElement.selectedIndex].value,
                        ranker: algorithmElement.options[algorithmElement.selectedIndex].value,
                        dailynoteExcluded: dailynoteExcludedElement.options[dailynoteExcludedElement.selectedIndex].value
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

        const dailynoteExcludedElement = document.createElement("select");
        dailynoteExcludedElement.id = "dailynoteExcluded";
        dailynoteExcludedElement.add(new Option(i18n.yes, "true"));
        dailynoteExcludedElement.add(new Option(i18n.no, "false"));
        plugin.setting.addItem({
            title: i18n.settingDailynoteExcluded,
            createActionElement: () => {
                dailynoteExcludedElement.value = plugin.data[STORAGE_NAME].dailynoteExcluded;
                return dailynoteExcludedElement;
            },
        });

    }
}

export const pluginSetting: PluginSetting = new PluginSetting();