/*
 * Settings
 */

import {
    SettingsAdvanced,
    SettingsButtonAction,
    SettingsCustomizer,
    SettingsDiscount,
    SettingsGeneral,
    SettingsNotifications,
    SettingsOnlineShop,
    SettingsSubscriptions,
    SettingsTabNavInfo,
    SettingsTools,
    SettingsVariantSelectorType,
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
        title: "Customizer",
        icon: "edit",
        component: SettingsCustomizer,
    },
    {
        id: "discount",
        title: "Discount",
        icon: "discount",
        component: SettingsDiscount,
        visible: (ctx) => ctx.isPro,
    },
    {
        id: "button_action",
        title: "Button action",
        icon: "button",
        component: SettingsButtonAction,
    },
    {
        id: "variant_selector",
        title: "Variant selector type",
        icon: "variant",
        component: SettingsVariantSelectorType,
    },
    {
        id: "notifications",
        title: "Notifications",
        icon: "notification",
        component: SettingsNotifications,
    },
    {
        id: "enable_online_shop",
        title: "Enable in online shop",
        icon: "adjust",
        component: SettingsOnlineShop,
        visible: (ctx) => ctx.hasOnlineStore,
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
