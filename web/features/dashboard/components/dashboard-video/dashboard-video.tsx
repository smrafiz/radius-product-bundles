"use client";

import React from "react";
import { SkeletonLines } from "@/shared";
import { useAnalytics } from "@/features/analytics";
import { DashboardVideoItem } from "@/features/dashboard";
import { DASHBOARD_VIDEO_ITEMS } from "@/features/dashboard";

/**
 * Dashboard video grid section displaying multiple video items
 */
export function DashboardVideo({ lines = 8 }: { lines?: number }) {
    const { isLoading } = useAnalytics();

    if (isLoading) {
        return (
            <s-section padding="base">
                <s-box>
                    <div className="animate-pulse space-y-3">
                        <SkeletonLines lines={lines} random={true} />
                    </div>
                </s-box>
            </s-section>
        );
    }

    return (
        <s-section>
            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                gap="base"
                justifyContent="center"
            >
                {DASHBOARD_VIDEO_ITEMS.map((video) => (
                    <s-grid-item key={video.id} gridColumn="auto">
                        <DashboardVideoItem video={video} />
                    </s-grid-item>
                ))}
            </s-grid>
        </s-section>
    );
}

export default DashboardVideo;