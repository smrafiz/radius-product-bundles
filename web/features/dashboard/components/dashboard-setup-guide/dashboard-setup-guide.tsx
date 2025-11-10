"use client";

import { useState } from "react";
import {
    DASHBOARD_SETUP_ITEMS,
    DashboardSetupConfig,
    DashboardSetupSteps,
    useDashboardStore,
} from "@/features/dashboard";

export function DashboardSetUpGuide() {
    const { loading } = useDashboardStore();
    const [showGuide, setShowGuide] = useState(true);
    const [items, setItems] = useState<DashboardSetupConfig[]>(DASHBOARD_SETUP_ITEMS);

    if (loading) {
        return (
            <s-section padding="base">
                <div className="p-4">
                    <s-stack gap="base">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-2 bg-[#f4f4f4] rounded overflow-hidden relative"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-[#f4f4f4] via-[#f8f8f8] to-[#f4f4f4] animate-shimmer"
                                    style={{
                                        width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                        animationDuration: `${1 + Math.random() * 1.5}s`,
                                    }}
                                />
                            </div>
                        ))}
                    </s-stack>
                </div>
            </s-section>
        );
    }

    // Example of step complete handler, adjust for your use case
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

    if (!showGuide)
        return (
            <s-button onClick={() => setShowGuide(true)}>
                Show Setup Guide
            </s-button>
        );

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