import { i18n, plugin, STORAGE_NAME } from "./utils";
import { Setting, showMessage } from "siyuan";
import { autoFollow } from "./dock";

export function getSetting(settingName: string): string {
    return plugin.data[STORAGE_NAME][settingName];
}

export function settingInit() {
    plugin.setting = new Setting({
        confirmCallback: () => {
            if (!/^[0-9]+$/.test(nodesMaximumElement.value)) {
                showMessage(
                    i18n.checkNodesMaximumErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            if (!/^[0-9]+$/.test(neighborDepthElement.value)) {
                showMessage(
                    i18n.checkNeighborDepthErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            if (!/^[0-9]+$/.test(sourceThresholdElement.value)) {
                showMessage(
                    i18n.checkSourceThresholdErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            if (!/^[0-9]+$/.test(sinkThresholdElement.value)) {
                showMessage(
                    i18n.checkSinkThresholdErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            plugin.saveData(STORAGE_NAME,
                {
                    rankdir: directionElement.value,
                    ranker: algorithmElement.value,
                    dailynoteExcluded: dailynoteExcludedElement.value,
                    nodesMaximum: nodesMaximumElement.value,
                    neighborDepth: neighborDepthElement.value,
                    autoFollow: autoFollowElement.value,
                    sourceThreshold: sourceThresholdElement.value,
                    sinkThreshold: sinkThresholdElement.value,
                    separation: separationElement.value
                });


            if (autoFollowElement.value === "true") {
                plugin.eventBus.off("click-editorcontent", autoFollow);
                plugin.eventBus.on("click-editorcontent", autoFollow);
            } else {
                plugin.eventBus.off("click-editorcontent", autoFollow);
            }

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

    const autoFollowElement = document.createElement("select");
    autoFollowElement.id = "autoFollow";
    autoFollowElement.add(new Option(i18n.yes, "true"));
    autoFollowElement.add(new Option(i18n.no, "false"));
    plugin.setting.addItem({
        title: i18n.autoFollow,
        createActionElement: () => {
            autoFollowElement.value = plugin.data[STORAGE_NAME].autoFollow;
            return autoFollowElement;
        },
    });

    const nodesMaximumElement = document.createElement("input");
    nodesMaximumElement.id = "nodesMaximum";
    nodesMaximumElement.placeholder = i18n.pleaseInputNumber;
    nodesMaximumElement.className = "b3-text-field";
    plugin.setting.addItem({
        title: i18n.nodesMaximum,
        createActionElement: () => {
            nodesMaximumElement.value = plugin.data[STORAGE_NAME].nodesMaximum;
            return nodesMaximumElement;
        },
    });

    const neighborDepthElement = document.createElement("input");
    neighborDepthElement.id = "neighborDepth";
    neighborDepthElement.placeholder = i18n.pleaseInputNumber;
    neighborDepthElement.className = "b3-text-field";
    plugin.setting.addItem({
        title: i18n.settingNeighborDepth,
        createActionElement: () => {
            neighborDepthElement.value = plugin.data[STORAGE_NAME].neighborDepth;
            return neighborDepthElement;
        },
    });

    const sourceThresholdElement = document.createElement("input");
    sourceThresholdElement.id = "sourceThreshold";
    sourceThresholdElement.placeholder = i18n.pleaseInputNumber;
    sourceThresholdElement.className = "b3-text-field";
    plugin.setting.addItem({
        title: i18n.settingSourceThreshold,
        createActionElement: () => {
            sourceThresholdElement.value = plugin.data[STORAGE_NAME].sourceThreshold;
            return sourceThresholdElement;
        },
    });

    const sinkThresholdElement = document.createElement("input");
    sinkThresholdElement.id = "sinkThreshold";
    sinkThresholdElement.placeholder = i18n.pleaseInputNumber;
    sinkThresholdElement.className = "b3-text-field";
    plugin.setting.addItem({
        title: i18n.settingSinkThreshold,
        createActionElement: () => {
            sinkThresholdElement.value = plugin.data[STORAGE_NAME].sinkThreshold;
            return sinkThresholdElement;
        },
    });

    const separationElement = document.createElement("textarea");
    separationElement.id = "separation";
    separationElement.placeholder = i18n.pleaseInput;
    separationElement.className = "b3-text-field fn__block";
    plugin.setting.addItem({
        title: i18n.separationTitle,
        createActionElement: () => {
            separationElement.value = plugin.data[STORAGE_NAME].separation;
            return separationElement;
        },
    });
}
