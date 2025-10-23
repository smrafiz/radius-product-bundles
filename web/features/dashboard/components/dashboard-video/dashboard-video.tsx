'use client';
import React, { useRef, useEffect } from 'react';

export function DashboardVideo() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoUrl = 'https://youtu.be/gsw2NYVrPfM';

    // Detect YouTube vs direct video
    const isYouTube: boolean = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const embedUrl: string = isYouTube
        ? videoUrl
            .replace('youtu.be/', 'www.youtube.com/embed/')
            .replace('watch?v=', 'embed/') + '?autoplay=1&mute=1'
        : videoUrl;

    // --- Handle modal open/close events ---
    useEffect(() => {
        const modal = document.getElementById('video-modal') as HTMLElement | null;
        if (!modal) return;

        const handleShow = (): void => {
            // YouTube autoplay
            const iframe = modal.querySelector('iframe') as HTMLIFrameElement | null;
            if (iframe && iframe.src) {
                iframe.src = iframe.src.includes('?')
                    ? `${iframe.src}&autoplay=1`
                    : `${iframe.src}?autoplay=1`;
            }

            // MP4 autoplay
            if (videoRef.current) {
                videoRef.current.play().catch(() => {
                    console.warn('Autoplay blocked by browser');
                });
            }
        };

        const handleHide = (): void => {
            // Stop YouTube playback
            const iframe = modal.querySelector('iframe') as HTMLIFrameElement | null;
            if (iframe && iframe.src) {
                iframe.src = iframe.src.replace('&autoplay=1', '').replace('?autoplay=1', '');
            }

            // Stop MP4 video
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        };

        modal.addEventListener('--show', handleShow);
        modal.addEventListener('--hide', handleHide);

        return () => {
            modal.removeEventListener('--show', handleShow);
            modal.removeEventListener('--hide', handleHide);
        };
    }, []);

    return (
        <s-section>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* LEFT SIDE: Thumbnail */}
                <div className="relative sm:max-w-[300px] w-full">
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        {isYouTube ? (
                            <img
                                src={`https://img.youtube.com/vi/${videoUrl.split('/').pop()}/hqdefault.jpg`}
                                alt="Video thumbnail"
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                        ) : (
                            <video
                                style={{
                                    width: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                }}
                                muted
                                src={videoUrl}
                            />
                        )}

                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <s-button variant="secondary" commandFor="video-modal" command="--show">
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
                            Bundles are a great way to increase average order value, move
                            slow-moving inventory, and offer more value to your customers.
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
                        style={{ borderRadius: '8px' }}
                    ></iframe>
                ) : (
                    <video
                        ref={videoRef}
                        controls
                        muted
                        autoPlay
                        style={{ width: '100%', borderRadius: '8px' }}
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
