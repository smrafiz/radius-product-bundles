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
    SettingsStoreInformation,
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
            case "store_information":
                return <SettingsStoreInformation />;
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
                return <s-text>No content found.</s-text>;
        }
    };

    return (
        <s-box>
            <s-grid gridTemplateColumns="250px 1fr" gap="base">
                {/* Left: Tab list */}
                <s-grid-item>
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
                                                : "hover:bg-gray-200 font-normal"
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
                </s-grid-item>

                {/* Right: Active content */}
                <s-grid-item>
                    <s-section>
                        {activeTabData ? (
                            <s-stack>{renderActiveComponent()}</s-stack>
                        ) : (
                            <s-text>No content found.</s-text>
                        )}
                    </s-section>
                </s-grid-item>
            </s-grid>
        </s-box>
    );
};
