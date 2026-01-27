"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

export interface DashboardVideoConfig {
    id: number;
    videoUrl: string;
    title?: string;
    description?: string;
}

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
 * Individual video card with thumbnail and modal
 */
export function DashboardVideoItem({ video }: { video: DashboardVideoConfig }) {
    const modalId = `video-modal-${video.id}`;
    const isYouTube = isYouTubeUrl(video.videoUrl);
    const ytId = getYouTubeId(video.videoUrl);

    return (
        <>
            <s-box padding="none">
                <s-stack gap="small">
                    {/* Thumbnail */}
                    <div className="relative cursor-pointer">
                        {isYouTube && ytId ? (
                            <img
                                src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                                alt={video.title || "Video thumbnail"}
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
                            <s-button
                                variant="secondary"
                                commandFor={modalId}
                                command="--show"
                            >
                                <s-icon type="play" />
                            </s-button>
                        </div>
                    </div>

                    {/* Content */}
                    <s-stack gap="small-300">
                        <s-heading>{video.title || "Watch Video"}</s-heading>
                        {video.description && (
                            <s-text>{video.description}</s-text>
                        )}
                    </s-stack>

                    <s-button
                        variant="secondary"
                        tone="auto"
                        commandFor={modalId}
                        command="--show"
                    >
                        Watch Video
                    </s-button>
                </s-stack>
            </s-box>

            {/* Modal */}
            <VideoModal
                modalId={modalId}
                videoUrl={video.videoUrl}
                title={video.title}
            />
        </>
    );
}

/**
 * Video modal component with play/pause controls
 */
function VideoModal({
    modalId,
    videoUrl,
    title,
}: {
    modalId: string;
    videoUrl: string;
    title?: string;
}) {
    const modalRef = useRef<HTMLElement | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) {
            return;
        }

        const handleShow = () => {
            setTimeout(() => setPlaying(true), 50);
        };

        const handleHide = () => {
            setPlaying(false);
        };

        modal.addEventListener("show", handleShow);
        modal.addEventListener("hide", handleHide);

        return () => {
            modal.removeEventListener("show", handleShow);
            modal.removeEventListener("hide", handleHide);
        };
    }, []);

    return (
        <s-modal
            size="large"
            id={modalId}
            ref={modalRef as any}
            heading={title || "Video Tutorial"}
        >
            <ReactPlayer
                src={videoUrl}
                playing={playing}
                muted={true}
                controls={true}
                playsInline
                width="100%"
                height="auto"
                style={{ aspectRatio: "16/9" }}
                className="rounded-lg overflow-hidden"
            />

            <s-button
                slot="primary-action"
                variant="primary"
                commandFor={modalId}
                command="--hide"
            >
                Close
            </s-button>
        </s-modal>
    );
}

export default DashboardVideoItem;
