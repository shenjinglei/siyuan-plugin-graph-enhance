import { i18n, plugin, STORAGE_NAME } from "./utils";
import { Setting, showMessage } from "siyuan";
import type { PopoverTrigger, SettingKey } from "./types";
import { DEFAULT_POPOVER_DELAY_MS, MAX_POPOVER_DELAY_MS } from "./constants";

export const DEFAULT_SETTINGS = {
    ranker: "network-simplex",
    nodesMaximum: "200",
    nodesExclusion: "",
    font: "system-ui",
    fontSize: "12",
    popoverTrigger: "hover",
    popoverDelay: String(DEFAULT_POPOVER_DELAY_MS),
} as Record<SettingKey, string>;

export function isValidPopoverDelay(value: string): boolean {
    return /^[0-9]+$/.test(value) && parseInt(value) <= MAX_POPOVER_DELAY_MS;
}

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
            if (!/^[0-9]+$/.test(fontSizeElement.value)) {
                showMessage(
                    i18n.checkFontSizeErrorMsg,
                    3000,
                    "error"
                );
                return;
            }
            if (popoverTriggerElement.value === "hover" && !isValidPopoverDelay(popoverDelayElement.value)) {
                showMessage(
                    i18n.checkPopoverDelayErrorMsg,
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
                ranker: algorithmElement.value,
                nodesMaximum: nodesMaximumElement.value,
                nodesExclusion: nodesExclusionElement.value,
                font: getFontValue(),
                fontSize: fontSizeElement.value,
                popoverTrigger: popoverTriggerElement.value,
                popoverDelay: isValidPopoverDelay(popoverDelayElement.value)
                    ? popoverDelayElement.value
                    : getSetting("popoverDelay"),
            };
            plugin.saveData(STORAGE_NAME, payload);
        }
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

    const popoverTriggerElement = document.createElement("select");
    popoverTriggerElement.id = "popoverTrigger";
    popoverTriggerElement.className = "b3-select";
    const popoverTriggers: [PopoverTrigger, string][] = [
        ["hover", i18n.popoverTriggerHover],
        ["ctrl", i18n.popoverTriggerCtrl],
        ["none", i18n.popoverTriggerNone],
    ];
    popoverTriggers.forEach(([value, label]) => {
        popoverTriggerElement.add(new Option(label, value));
    });

    const popoverDelayElement = document.createElement("input");
    popoverDelayElement.id = "popoverDelay";
    popoverDelayElement.type = "number";
    popoverDelayElement.min = "0";
    popoverDelayElement.max = String(MAX_POPOVER_DELAY_MS);
    popoverDelayElement.step = "100";
    popoverDelayElement.placeholder = i18n.pleaseInputNumber;
    popoverDelayElement.className = "b3-text-field";

    // The delay only applies to the "hover" trigger, so hide its whole setting row otherwise.
    const updatePopoverDelayVisibility = () => {
        const row = popoverDelayElement.closest<HTMLElement>(".config-item");
        if (row) {
            row.style.display = popoverTriggerElement.value === "hover" ? "" : "none";
        }
    };
    popoverTriggerElement.addEventListener("change", updatePopoverDelayVisibility);

    plugin.setting.addItem({
        title: i18n.popoverTriggerTitle,
        description: i18n.popoverTriggerDescription,
        createActionElement: () => {
            popoverTriggerElement.value = getSetting("popoverTrigger");
            return popoverTriggerElement;
        },
    });

    plugin.setting.addItem({
        title: i18n.popoverDelayTitle,
        description: i18n.popoverDelayDescription,
        createActionElement: () => {
            popoverDelayElement.value = getSetting("popoverDelay");
            // Rows are inserted into the dialog right after this returns.
            setTimeout(updatePopoverDelayVisibility, 0);
            return popoverDelayElement;
        },
    });
}
