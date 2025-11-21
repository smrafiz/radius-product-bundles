"use client";
import React, { useRef, useEffect, useState } from "react";
import { useDashboardStore } from "@/features/dashboard";
import { SkeletonLines } from "@/shared";
import ReactPlayer from "react-player";

function getYouTubeId(url: string) {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        if (u.hostname.includes("youtube.com")) return  u.searchParams.get("v") || null;
        return null;
    } catch {
        const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return m ? m[1] : null;
    }
}

export function DashboardVideo({ lines = 8 }: { lines?: number }) {
    const { loading } = useDashboardStore();
    //const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoUrl = "https://www.youtube.com/watch?v=wDchsz8nmbo";

    const isYouTube: boolean =
        videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    const ytId = getYouTubeId(videoUrl);

    // const embedUrl: string = isYouTube
    //     ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`
    //     : videoUrl;

    // useEffect(() => {
    //     // This effect attempted to manipulate iframe src directly using --show/--hide.
    //     // We will not rely on this approach; playback will be controlled in the Modal component
    //     // by proper event listeners. Keep effect minimal for MP4 fallback if you want.
    //     return () => {};
    // }, []);

    if (loading) {
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
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* LEFT SIDE: Thumbnail */}
                <div className="relative sm:max-w-[300px] w-full">
                    <div className="relative cursor-pointer">
                        {isYouTube ? (
                            <img
                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                alt="Video thumbnail"
                                className="w-full rounded-[8px]"
                            />
                        ) : (
                            <video
                                className="w-full object-cover rounded-[8px]"
                                muted
                                src={videoUrl}
                            />
                        )}

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <s-button
                                variant="secondary"
                                commandFor="video-modal"
                                command="--show"
                            >
                                <s-icon type="play" />
                            </s-button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <s-grid alignItems="center">
                    <s-stack gap="small">
                        <s-heading>See it in action</s-heading>
                        <s-text>
                            Bundles are a great way to increase average order value, move slow-moving
                            inventory, and offer more value to your customers.
                        </s-text>
                        <s-button
                            variant="secondary"
                            tone="auto"
                            commandFor="video-modal"
                            command="--show"
                        >
                            Watch Video
                        </s-button>
                    </s-stack>
                </s-grid>
            </div>

            {/* Modal */}
            <Modal videoUrl={videoUrl} />
        </s-section>
    );
}

export default function Modal({ videoUrl }: { videoUrl: string }) {
    const modalRef = useRef<HTMLElement | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        const handleAfterShow = () => {
            console.log("aftershow → mount complete");
            setTimeout(() => {
                console.log("PLAYING TRUE");
                setPlaying(true);
            }, 50);
        };

        const handleHide = () => {
            console.log("hide → stopping");
            setPlaying(false);
        };

        modal.addEventListener("aftershow", handleAfterShow);
        modal.addEventListener("hide", handleHide);

        return () => {
            modal.removeEventListener("aftershow", handleAfterShow);
            modal.removeEventListener("hide", handleHide);
        };
    }, []);

    return (
        <s-modal id="video-modal" ref={modalRef as any} heading="Video Tutorial">
            <ReactPlayer
                src={videoUrl}
                playing={playing}
                controls
                width="100%"
                height="400px"
            />

            <s-button
                slot="primary-action"
                variant="primary"
                commandFor="video-modal"
                command="--hide"
            >
                Close
            </s-button>
        </s-modal>
    );
}
