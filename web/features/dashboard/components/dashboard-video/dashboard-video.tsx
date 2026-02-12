"use client";

import {
    DashboardVideoItem,
    DashboardVideoConfig,
    DashboardVideoModal,
} from "@/features/dashboard";
import { SkeletonLines } from "@/shared";
import { useAnalytics } from "@/features/analytics";
import React, { useCallback, useRef, useState } from "react";
import { DASHBOARD_VIDEO_ITEMS } from "@/features/dashboard/constants/dashboard.constants";

/**
 * Dashboard video grid section displaying multiple video items
 */
export function DashboardVideo({ lines = 8 }: { lines?: number }) {
    const { isLoading } = useAnalytics();
    const [activeVideo, setActiveVideo] = useState<DashboardVideoConfig | null>(
        null,
    );
    const positionsRef = useRef<Record<number, number>>({});

    const handlePlay = useCallback((video: DashboardVideoConfig) => {
        setActiveVideo(video);
    }, []);

    const handleClose = useCallback(() => {
        setActiveVideo(null);
    }, []);

    const handleTimeUpdate = useCallback(
        (seconds: number) => {
            if (activeVideo) {
                positionsRef.current[activeVideo.id] = seconds;
            }
        },
        [activeVideo],
    );

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
                        <DashboardVideoItem video={video} onPlayAction={handlePlay} />
                    </s-grid-item>
                ))}
            </s-grid>

            <DashboardVideoModal
                video={activeVideo}
                savedTime={
                    activeVideo
                        ? (positionsRef.current[activeVideo.id] ?? 0)
                        : 0
                }
                onClose={handleClose}
                onTimeUpdate={handleTimeUpdate}
            />
        </s-section>
    );
}

export default DashboardVideo;
