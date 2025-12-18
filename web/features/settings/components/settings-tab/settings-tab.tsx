"use client";

import { useState } from "react";
import { SETTINGS_TAB_NAV } from "@/features/settings";
import {
    SettingsTools,
    SettingsGeneral,
    SettingsDiscount,
    SettingsAdvanced,
    SettingsOnlineShop,
    SettingsBundleWidget,
    SettingsButtonAction,
    SettingsSubscriptions,
    SettingsNotifications,
    SettingsCustomizer,
    SettingsVariantSelectorType,
} from "@/features/settings";

export const SettingsTab = () => {
    const [activeTab, setActiveTab] = useState<string>(SETTINGS_TAB_NAV[0].id);

    const activeTabData = SETTINGS_TAB_NAV.find((tab) => tab.id === activeTab);

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "general":
                return <SettingsGeneral />;
            case "bundle_widget":
                return <SettingsBundleWidget />;
            case "customizer":
                return <SettingsCustomizer />;
            case "discount":
                return <SettingsDiscount />;
            case "subscriptions":
                return <SettingsSubscriptions />;
            case "button_action":
                return <SettingsButtonAction />;
            case "variant_selector":
                return <SettingsVariantSelectorType />;
            case "notifications":
                return <SettingsNotifications />;
            case "enable_online_shop":
                return <SettingsOnlineShop />;
            case "advanced":
                return <SettingsAdvanced />;
            case "tools":
                return <SettingsTools />;
            default:
                return <s-text>No settings found.</s-text>;
        }
    };

    return (
        <s-box>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left: Tab list */}
                <div className="md:col-span-4">
                    <s-section>
                        <s-stack gap="small-500">
                            {SETTINGS_TAB_NAV.map((tab) => (
                                <s-clickable
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <div
                                        className={`p-2 rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? "bg-gray-200 font-semibold"
                                                : "hover:bg-gray-100 font-normal"
                                        }`}
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="small-300"
                                        >
                                            <s-icon
                                                size="base"
                                                type={tab.icon}
                                                tone={
                                                    activeTab === tab.id
                                                        ? "success"
                                                        : undefined
                                                }
                                            />
                                            <s-text
                                                tone={
                                                    activeTab === tab.id
                                                        ? "success"
                                                        : undefined
                                                }
                                            >
                                                {tab.title}
                                            </s-text>
                                        </s-stack>
                                    </div>
                                </s-clickable>
                            ))}
                        </s-stack>
                    </s-section>
                </div>
                {/* Right: Active content */}
                <div className="md:col-span-8">
                    <s-section>
                        {activeTabData ? (
                            <s-stack>{renderActiveComponent()}</s-stack>
                        ) : (
                            <s-text>No content found.</s-text>
                        )}
                    </s-section>
                </div>
            </div>
        </s-box>
    );
};
