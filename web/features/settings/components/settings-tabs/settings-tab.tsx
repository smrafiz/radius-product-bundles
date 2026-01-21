"use client";

import { useMemo, useState } from "react";
import {
    AnimatedTabPanel,
    SettingsTabId,
    useSettingsTabs,
} from "@/features/settings";
import { AnimatePresence } from "framer-motion";

export const SettingsTab = () => {
    /** Feature flags – later this can come from API / app config */
    const featureContext = {
        isPro: true,
        hasOnlineStore: true,
        hasSubscriptions: false,
    };

    const tabs = useSettingsTabs(featureContext);

    const [activeTab, setActiveTab] = useState<SettingsTabId>(tabs[0].id);

    const activeTabData = useMemo(
        () => tabs.find((tab) => tab.id === activeTab),
        [tabs, activeTab],
    );

    return (
        <s-box>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left: Tabs */}
                <div className="md:col-span-4">
                    <s-section>
                        <s-stack gap="small-500">
                            {tabs.map((tab) => (
                                <s-clickable
                                    key={tab.id}
                                    borderRadius="base"
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <div
                                        className={`p-2 rounded-md transition-colors ${
                                            activeTab === tab.id
                                                ? "bg-[#ebebeb] font-semibold"
                                                : "hover:bg-[#f7f7f7]"
                                        }`}
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="small-300"
                                            alignItems="center"
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

                {/* Right: Content */}
                <div className="md:col-span-8">
                    <AnimatePresence mode="wait">
                        {activeTabData ? (
                            <AnimatedTabPanel tabKey={activeTabData.id}>
                                <activeTabData.component />
                            </AnimatedTabPanel>
                        ) : (
                            <s-text>No content found.</s-text>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </s-box>
    );
};
