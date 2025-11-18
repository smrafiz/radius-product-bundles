"use client";

import {
    DASHBOARD_SETUP_ITEMS,
    DashboardSetupConfig,
    DashboardSetupSteps,
    useDashboardStore,
} from "@/features/dashboard";
import { useState } from "react";
import { SkeletonLines } from "@/shared";

/**
 * Dashboard setup guide component
 */
export function DashboardSetUpGuide() {
    const { loading } = useDashboardStore();
    const [showGuide, setShowGuide] = useState(true);
    const [items, setItems] = useState<DashboardSetupConfig[]>(
        DASHBOARD_SETUP_ITEMS,
    );

    /**
     * Handle step completion
     */
    const onStepComplete = async (id: number): Promise<void> => {
        try {
            // Simulate API call
            await new Promise<void>((res) => setTimeout(res, 1000));

            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, complete: !item.complete }
                        : item,
                ),
            );
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={12} random={true} />
                </div>
            </s-section>
        );
    }

    if (!showGuide) {
        return (
            <s-button onClick={() => setShowGuide(true)}>
                Show Setup Guide
            </s-button>
        );
    }

    return (
        <DashboardSetupSteps
            items={items as any}
            onDismiss={() => {
                setShowGuide(false);
                setItems(DASHBOARD_SETUP_ITEMS);
            }}
            onStepComplete={onStepComplete}
        />
    );
}
