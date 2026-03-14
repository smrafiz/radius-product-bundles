"use client";

import { useMemo, useState } from "react";
import { SETTINGS_TABS } from "@/features/settings/configs/tabs.config";
import { SettingsTabConfig, SettingsTabId } from "@/features/settings";
import { AnimatedTabPanel } from "../settings-page/animated-tab-panel";
import { DynamicSettingsTab } from "./dynamic-settings-tab";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Dynamic settings tabs component.
 *
 * Renders tabs and content from SETTINGS_TABS config.
 */
export function SettingsTab() {
    const [activeTab, setActiveTab] = useState<SettingsTabId>(
        SETTINGS_TABS[0].id,
    );

    const activeTabConfig = useMemo(
        () => SETTINGS_TABS.find((tab) => tab.id === activeTab),
        [activeTab],
    );

    return (
        <s-box>
            <s-grid gridTemplateColumns="250px 1fr" gap="base">
                {/* Left: Tab Navigation */}
                <s-grid-item>
                    <div className="sticky top-6">
                        <s-section padding="base">
                            {SETTINGS_TABS.map((tab) => (
                                <TabButton
                                    key={tab.id}
                                    tab={tab}
                                    isActive={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                />
                            ))}
                        </s-section>
                    </div>
                </s-grid-item>

                {/* Right: Tab Content */}
                <s-grid-item>
                    {activeTabConfig && (
                        <AnimatedTabPanel tabKey={activeTabConfig.id}>
                            <DynamicSettingsTab config={activeTabConfig} />
                        </AnimatedTabPanel>
                    )}
                </s-grid-item>
            </s-grid>
        </s-box>
    );
}

/**
 * Tab button component
 */
function TabButton({
    tab,
    isActive,
    onClick,
}: {
    tab: SettingsTabConfig;
    isActive: boolean;
    onClick: () => void;
}) {
    const t = useTranslations("Settings.Tabs");

    return (
        <s-clickable borderRadius="base" onClick={onClick}>
            <div
                className={`p-2 rounded-md transition-colors ${
                    isActive
                        ? "bg-[#ebebeb] font-semibold"
                        : "hover:bg-[#f7f7f7]"
                }`}
            >
                <s-stack direction="inline" gap="small-300" alignItems="center">
                    <s-icon
                        size="base"
                        type={tab.icon}
                        tone={isActive ? "success" : undefined}
                    />
                    <s-text tone={isActive ? "success" : undefined}>
                        {t(`${tab.id}.title`, undefined, tab.title)}
                    </s-text>
                </s-stack>
            </div>
        </s-clickable>
    );
}
