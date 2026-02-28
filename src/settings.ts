import { i18n, plugin, STORAGE_NAME } from "./utils";
import { Setting, showMessage } from "siyuan";
import { autoFollow } from "./dock";
import type { SettingKey } from "./types";

export const DEFAULT_SETTINGS = {
    rankdir: "LR",
    ranker: "network-simplex",
    nodesMaximum: "200",
    neighborDepth: "2",
    autoFollow: "true",
    separation: "",
    nodesExclusion: "",
    font: "system-ui",
    fontSize: "12",
} as Record<SettingKey, string>;

export function getSetting(name: SettingKey): string {
    return plugin.data[STORAGE_NAME][name] ?? DEFAULT_SETTINGS[name];
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
            if (!/^[0-9]+$/.test(fontSizeElement.value)) {
                showMessage(
                    i18n.checkFontSizeErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            const getFontValue = () => {
                if (fontElement.value === "custom") {
                    return customFontInput.value.trim() || "system-ui";
                }
                return fontElement.value;
            };

            const payload: Record<SettingKey, string> = {
                rankdir: directionElement.value,
                ranker: algorithmElement.value,
                nodesMaximum: nodesMaximumElement.value,
                neighborDepth: neighborDepthElement.value,
                autoFollow: autoFollowElement.value,
                separation: separationElement.value,
                nodesExclusion: nodesExclusionElement.value,
                font: getFontValue(),
                fontSize: fontSizeElement.value,
            };
            plugin.saveData(STORAGE_NAME, payload);


            if (autoFollowElement.value === "true") {
                plugin.eventBus.off("switch-protyle", autoFollow);
                plugin.eventBus.on("switch-protyle", autoFollow);
            } else {
                plugin.eventBus.off("switch-protyle", autoFollow);
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

    const separationElement = document.createElement("textarea");
    separationElement.id = "separation";
    separationElement.placeholder = i18n.pleaseInput;
    separationElement.className = "b3-text-field fn__block";
    plugin.setting.addItem({
        title: i18n.separationTitle,
        description: i18n.separationDescription,
        createActionElement: () => {
            separationElement.value = plugin.data[STORAGE_NAME].separation;
            return separationElement;
        },
    });

    const nodesExclusionElement = document.createElement("textarea");
    nodesExclusionElement.id = "nodesExclusion";
    nodesExclusionElement.placeholder = i18n.pleaseInput;
    nodesExclusionElement.className = "b3-text-field fn__block";
    plugin.setting.addItem({
        title: i18n.nodesExclusionTitle,
        description: i18n.nodesExclusionDescription,
        createActionElement: () => {
            nodesExclusionElement.value = plugin.data[STORAGE_NAME].nodesExclusion;
            return nodesExclusionElement;
        },
    });

    const fontElement = document.createElement("select");
    fontElement.id = "font";

    // Add common font options
    const commonFonts = [
        "system-ui", // System default font, cross-platform compatible
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Georgia",
        "Verdana",
        "Courier New",
        "Microsoft YaHei", // Microsoft YaHei
        "SimSun", // SimSun
        "SimHei", // SimHei
        "PingFang SC", // PingFang SC
        "Helvetica Neue",
        "sans-serif",
        "serif",
        "monospace"
    ];

    // Add common fonts to dropdown
    commonFonts.forEach(font => {
        fontElement.add(new Option(font, font));
    });

    // Add custom option
    const customOption = new Option(i18n.fontCustomOption, "custom");
    fontElement.add(customOption);

    // Create custom font input (initially hidden)
    const customFontInput = document.createElement("input");
    customFontInput.id = "customFont";
    customFontInput.placeholder = i18n.pleaseInput;
    customFontInput.className = "b3-text-field fn__block";
    customFontInput.style.display = "none";
    customFontInput.style.marginTop = "8px";

    // Listen for dropdown changes
    fontElement.addEventListener("change", () => {
        if (fontElement.value === "custom") {
            customFontInput.style.display = "block";
            customFontInput.focus();
        } else {
            customFontInput.style.display = "none";
        }
    });

    plugin.setting.addItem({
        title: i18n.fontTitle,
        description: i18n.fontDescription,
        createActionElement: () => {
            const savedFont = plugin.data[STORAGE_NAME].font;

            // Check if saved font is in common fonts list
            if (commonFonts.includes(savedFont)) {
                fontElement.value = savedFont;
                customFontInput.value = "";
            } else {
                fontElement.value = "custom";
                customFontInput.value = savedFont;
                customFontInput.style.display = "block";
            }

            // Create container to wrap multiple elements
            const container = document.createElement("div");
            container.appendChild(fontElement);
            container.appendChild(customFontInput);
            return container;
        },
    });

    const fontSizeElement = document.createElement("input");
    fontSizeElement.id = "fontSize";
    fontSizeElement.placeholder = i18n.pleaseInputNumber;
    fontSizeElement.className = "b3-text-field";
    plugin.setting.addItem({
        title: i18n.fontSizeTitle,
        description: i18n.fontSizeDescription,
        createActionElement: () => {
            fontSizeElement.value = plugin.data[STORAGE_NAME].fontSize;
            return fontSizeElement;
        },
    });
}
