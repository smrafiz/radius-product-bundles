"use client";
import { useRef, useEffect } from "react";
import { useDashboardStore } from "@/features/dashboard";
import { SkeletonLines } from "@/shared";

export function DashboardVideo({ lines = 8 }: { lines?: number }) {
    const { loading } = useDashboardStore();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoUrl = "https://youtu.be/gsw2NYVrPfM";

    const isYouTube: boolean =
        videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    const embedUrl: string = isYouTube
        ? videoUrl
              .replace("youtu.be/", "www.youtube.com/embed/")
              .replace("watch?v=", "embed/") //+ "?autoplay=1&mute=1"
        : videoUrl;

    useEffect(() => {
        const modal = document.getElementById(
            "video-modal",
        ) as HTMLElement | null;
        if (!modal) return;

        const handleShow = (): void => {
            // YouTube autoplay
            const iframe = modal.querySelector(
                "iframe",
            ) as HTMLIFrameElement | null;
            if (iframe && iframe.src) {
                iframe.src = iframe.src.includes("?")
                    ? `${iframe.src}&autoplay=1`
                    : `${iframe.src}?autoplay=1`;
            }

            // MP4 autoplay
            if (videoRef.current) {
                videoRef.current.play().catch(() => {
                    console.warn("Autoplay blocked by browser");
                });
            }
        };

        const handleHide = (): void => {
            // Stop YouTube playback
            const iframe = modal.querySelector(
                "iframe",
            ) as HTMLIFrameElement | null;
            if (iframe && iframe.src) {
                iframe.src = iframe.src
                    .replace("&autoplay=1", "")
                    .replace("?autoplay=1", "");
            }

            // Stop MP4 video
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        };

        modal.addEventListener("--show", handleShow);
        modal.addEventListener("--hide", handleHide);

        return () => {
            modal.removeEventListener("--show", handleShow);
            modal.removeEventListener("--hide", handleHide);
        };
    }, []);

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
                                src={`https://img.youtube.com/vi/${videoUrl.split("/").pop()}/hqdefault.jpg`}
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

                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
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
                            Bundles are a great way to increase average order
                            value, move slow-moving inventory, and offer more
                            value to your customers.
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
            <s-modal id="video-modal" heading="Video Tutorial">
                {isYouTube ? (
                    <iframe
                        width="100%"
                        height="400"
                        src={embedUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-[8px]"
                    ></iframe>
                ) : (
                    <video
                        ref={videoRef}
                        controls
                        muted
                        autoPlay
                        className="w-full rounded-[8px]"
                    >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}

                <s-button
                    slot="primary-action"
                    variant="primary"
                    commandFor="video-modal"
                    command="--hide"
                >
                    Close
                </s-button>
            </s-modal>
        </s-section>
    );
}
