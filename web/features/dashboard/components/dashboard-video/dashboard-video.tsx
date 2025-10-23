"use client";

import React, { useRef, useEffect } from "react";

export function DashboardVideo() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoUrl =
        "https://screenapp.io/screenapp-resources/upgrade-view/videos/v1/templates.mp4";

    // Handle modal open/close for video playback
    useEffect(() => {
        const modal = document.getElementById("video-modal");
        if (!modal) return;

        const handleShow = () => videoRef.current?.play();
        const handleHide = () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        };

        // Cast modal to EventTarget for TS safety
        modal.addEventListener("--show", handleShow as EventListener);
        modal.addEventListener("--hide", handleHide as EventListener);

        return () => {
            modal.removeEventListener("--show", handleShow as EventListener);
            modal.removeEventListener("--hide", handleHide as EventListener);
        };
    }, []);

    return (
        <s-section>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* LEFT SIDE: Video Thumbnail */}
                <div className="relative sm:max-w-[300px] w-full">
                    <div style={{ position: "relative", cursor: "pointer" }}>
                        <video
                            style={{
                                width: "100%",
                                objectFit: "cover",
                                borderRadius: "8px",
                            }}
                            muted
                            src={videoUrl}
                        />
                        {/* Play Button Overlay */}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <s-button
                                variant="secondary"
                                commandFor="video-modal"
                            >
                                <s-icon type="play" />
                            </s-button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Info */}
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

            {/* MODAL */}
            <s-modal id="video-modal" heading="Video Tutorial">
                <video
                    ref={videoRef}
                    controls
                    muted
                    autoPlay
                    style={{ width: "100%", borderRadius: "8px" }}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

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