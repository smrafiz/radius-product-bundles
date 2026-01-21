/*
 * Settings
 */

import {
    SettingsAdvanced,
    SettingsGeneral,
    SettingsLabels,
    SettingsStyle,
    SettingsTabNavInfo,
    SettingsTools,
} from "@/features/settings";

export const SETTINGS_TAB_NAV: readonly SettingsTabNavInfo[] = [
    {
        id: "general",
        title: "General",
        icon: "settings",
        component: SettingsGeneral,
    },
    {
        id: "customizer",
        title: "Style",
        icon: "edit",
        component: SettingsStyle,
    },
    {
        id: "labels",
        title: "Labels",
        icon: "text-block",
        component: SettingsLabels,
    },
    {
        id: "advanced",
        title: "Advanced",
        icon: "dns-settings",
        component: SettingsAdvanced,
        visible: (ctx) => ctx.isPro,
    },
    {
        id: "tools",
        title: "Tools",
        icon: "wrench",
        component: SettingsTools,
        visible: (ctx) => ctx.isPro,
    },
];
