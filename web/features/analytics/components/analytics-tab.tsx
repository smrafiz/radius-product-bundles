"use client";

import React, { useState } from "react";

import {
    AnalyticsBasedBundles,
    AnalyticsChart,
    AnalyticsDate,
    AnalyticsOrderBundles,
} from "@/features/analytics";
import { AnalyticsComparisonCharts } from "@/features/analytics/components/analytics-charts";

export function AnalyticsTabs() {
    const [activeTab, setActiveTab] = useState("tab1");

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                alignItems="center"
                gap="small-300"
                justifyContent="space-between"
            >
                {/* Tab Buttons */}
                <s-button-group gap="none">
                    <s-button
                        slot="secondary-actions"
                        variant={activeTab === "tab1" ? "primary" : "secondary"}
                        onClick={() => setActiveTab("tab1")}
                    >
                        Based bundle
                    </s-button>
                    <s-button
                        slot="secondary-actions"
                        variant={activeTab === "tab2" ? "primary" : "secondary"}
                        onClick={() => setActiveTab("tab2")}
                    >
                        Order bundle
                    </s-button>
                </s-button-group>

                <AnalyticsDate />
            </s-stack>

            {/* Tab Content */}
            <s-stack gap="base">
                {activeTab === "tab1" && (
                    <s-stack gap="base">
                        <AnalyticsChart />
                        <s-stack gap="small-200">
                            <AnalyticsComparisonCharts />
                        </s-stack>
                    </s-stack>
                )}
                {activeTab === "tab2" && (
                    <s-stack gap="base">
                        <AnalyticsBasedBundles />
                        <AnalyticsOrderBundles />
                    </s-stack>
                )}
            </s-stack>
        </s-stack>
    );
}
