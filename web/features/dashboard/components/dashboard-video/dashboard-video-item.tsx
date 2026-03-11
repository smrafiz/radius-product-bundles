"use client";

import React from "react";
import type { DashboardVideoConfig } from "@/features/dashboard/types/components.types";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Extracts YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        if (u.hostname.includes("youtube.com"))
            return u.searchParams.get("v") || null;
        return null;
    } catch {
        const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return m ? m[1] : null;
    }
}

/**
 * Checks if the URL is a YouTube video
 */
function isYouTubeUrl(url: string): boolean {
    return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Individual video card with thumbnail — no modal, calls onPlay to open shared modal
 */
export function DashboardVideoItem({
    video,
    onPlayAction,
}: {
    video: DashboardVideoConfig;
    onPlayAction: (video: DashboardVideoConfig) => void;
}) {
    const isYouTube = isYouTubeUrl(video.videoUrl);
    const ytId = getYouTubeId(video.videoUrl);
    const t = useTranslations("Dashboard.Videos");

    return (
        <s-box padding="none">
            <s-stack gap="small">
                {/* Thumbnail */}
                <div
                    className="relative cursor-pointer"
                    onClick={() => onPlayAction(video)}
                >
                    {isYouTube && ytId ? (
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                            alt={video.title || t("watchVideo")}
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    ) : (
                        <video
                            className="w-full h-auto object-cover rounded-lg"
                            muted
                            src={video.videoUrl}
                        />
                    )}

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <s-button variant="secondary">
                            <s-icon type="play" />
                        </s-button>
                    </div>
                </div>

                {/* Content */}
                <s-stack gap="small-300">
                    <s-heading>{video.title || t("watchVideo")}</s-heading>
                    {video.description && <s-text>{video.description}</s-text>}
                </s-stack>

                <s-button
                    variant="secondary"
                    tone="auto"
                    onClick={() => onPlayAction(video)}
                >
                    {t("watchVideo")}
                </s-button>
            </s-stack>
        </s-box>
    );
}

export default DashboardVideoItem;
