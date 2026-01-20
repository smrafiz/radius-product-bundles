"use client";

import {
    AllBundlesTable,
    AnalyticsBasedBundles,
    AnalyticsChart,
    AnalyticsComparisonCharts,
    AnalyticsDate,
    AnalyticsMetrics,
} from "@/features/analytics";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Analytics Tabs Component
 */
const TABS = [
    { key: "overview", label: "Overview", icon: "chart-vertical" },
    { key: "bundle-performance", label: "Bundle Performance", icon: "package" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AnalyticsTabs() {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const shouldReduceMotion = useReducedMotion();

    // Framer Motion variants
    const tabContentVariants = {
        initial: { opacity: 0, y: 5 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -3 },
    };

    return (
        <s-stack gap="base">
            {/* Header with tabs and date picker */}
            <s-stack
                direction="inline"
                alignItems="center"
                gap="small-300"
                justifyContent="space-between"
                borderRadius="base"
                padding="small-400"
                background="base"
            >
                {/* Tab buttons */}
                <s-stack
                    direction="inline"
                    gap="small-300"
                    borderRadius="base"
                    padding="small-200"
                    background="base"
                >
                    {TABS.map((tab) => (
                        <s-button
                            key={tab.key}
                            variant={
                                activeTab === tab.key ? "secondary" : "tertiary"
                            }
                            icon={tab.icon}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </s-button>
                    ))}
                </s-stack>

                {/* Date picker */}
                <s-stack
                    direction="inline"
                    gap="none"
                    borderRadius="base"
                    padding="small-200"
                    background="base"
                >
                    <AnalyticsDate />
                </s-stack>
            </s-stack>

            {/* Metrics cards */}
            <AnalyticsMetrics />

            {/* Tab content with animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={
                        shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.15, ease: "easeOut" }
                    }
                >
                    {activeTab === "overview" ? (
                        <s-stack gap="base">
                            <AnalyticsChart />
                            <AnalyticsComparisonCharts />
                        </s-stack>
                    ) : (
                        <s-stack gap="base">
                            <AnalyticsBasedBundles />
                            <AllBundlesTable />
                        </s-stack>
                    )}
                </motion.div>
            </AnimatePresence>
        </s-stack>
    );
}
