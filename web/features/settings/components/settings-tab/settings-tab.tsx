"use client";

import React, { useState } from "react";
import { SETTINGS_TAB_NAV } from "@/features/settings";
import {
    SettingsTabItem,
    SettingsTabItemOne,
    SettingsTabItemTwo,
    SettingsTabItemThree
} from "@/features/settings";

export const SettingsTab = () => {
    const [activeTab, setActiveTab] = useState<string>(SETTINGS_TAB_NAV[0].id);

    const activeTabData = SETTINGS_TAB_NAV.find((tab) => tab.id === activeTab);

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "general":
                return <SettingsTabItem />;
            case "discount":
                return <SettingsTabItemOne />;
            case "subscription":
                return <SettingsTabItemTwo />;
            case "button_action":
                return <SettingsTabItemThree />;
            default:
                return <s-text>No content found.</s-text>;
        }
    };

    return (
        <s-box>
            <s-grid gridTemplateColumns="250px 1fr" gap="base">
                {/* Left: Tab list */}
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
                                            ? "bg-gray-100 font-semibold"
                                            : "hover:bg-gray-100 hover!:rounded-lg font-normal"
                                    }`}
                                >
                                    {tab.title}
                                </div>
                            </s-clickable>
                        ))}
                    </s-stack>
                </s-section>

                {/* Right: Active content */}
                <s-section padding="base">
                    {activeTabData ? (
                        <s-stack>{renderActiveComponent()}</s-stack>
                    ) : (
                        <s-text>No content found.</s-text>
                    )}
                </s-section>
            </s-grid>
        </s-box>
    );
};
