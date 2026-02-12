"use client";

import ReactPlayer from "react-player";
import type { DashboardVideoModalProps } from "@/features/dashboard";
import React, { useCallback, useEffect, useRef, useState } from "react";

const MODAL_ID = "dashboard-video-modal";

/**
 * Single shared video modal — opens for whichever video is active,
 */
export function DashboardVideoModal({
    video,
    savedTime,
    onClose,
    onTimeUpdate,
}: DashboardVideoModalProps) {
    const modalRef = useRef<HTMLElement | null>(null);
    const playerRef = useRef<HTMLVideoElement | null>(null);
    const [playing, setPlaying] = useState(false);

    // Show/hide modal + autoplay when video changes
    useEffect(() => {
        const modal = modalRef.current;

        if (!modal) {
            return;
        }

        if (video) {
            (modal as any).showOverlay?.();
            setTimeout(() => {
                setPlaying(true);
                if (savedTime > 0 && playerRef.current) {
                    playerRef.current.currentTime = savedTime;
                }
            }, 50);
        } else {
            (modal as any).hideOverlay?.();
            setPlaying(false);
        }

        const handleHide = () => {
            setPlaying(false);
            onClose();
        };

        modal.addEventListener("hide", handleHide);

        return () => {
            modal.removeEventListener("hide", handleHide);
        };
    }, [video, savedTime, onClose]);

    // Track playback position
    const handleTimeUpdate = useCallback(
        (e: React.SyntheticEvent<HTMLVideoElement>) => {
            const currentTime = (e.target as HTMLVideoElement).currentTime;

            if (currentTime > 0) {
                onTimeUpdate(currentTime);
            }
        },
        [onTimeUpdate],
    );

    // Seek to saved position once the player is ready
    const handleCanPlay = useCallback(() => {
        if (savedTime > 0 && playerRef.current) {
            playerRef.current.currentTime = savedTime;
        }
    }, [savedTime]);

    return (
        <s-modal
            size="large-100"
            id={MODAL_ID}
            ref={modalRef as any}
            heading={video?.title || "Video Tutorial"}
            accessibilityLabel={video?.title || "Video Tutorial"}
        >
            <div
                className="rounded-lg overflow-hidden"
                style={{ aspectRatio: "16/9", width: "100%" }}
            >
                {video && (
                    <ReactPlayer
                        ref={playerRef as any}
                        src={video.videoUrl}
                        playing={playing}
                        muted={true}
                        controls={true}
                        playsInline
                        width="100%"
                        height="100%"
                        onTimeUpdate={handleTimeUpdate}
                        onCanPlay={handleCanPlay}
                    />
                )}
            </div>

            <s-button
                slot="primary-action"
                variant="primary"
                commandFor={MODAL_ID}
                command="--hide"
            >
                Close
            </s-button>
        </s-modal>
    );
}
