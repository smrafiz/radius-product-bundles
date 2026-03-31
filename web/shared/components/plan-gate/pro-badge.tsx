"use client";

import { useCrossSellStore } from "./cross-sell-modal";

interface ProBadgeProps {
    label?: string;
    onClick?: () => void;
}

export function ProBadge({ label, onClick }: ProBadgeProps) {
    const { open } = useCrossSellStore();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            open(label ?? "this feature");
        }
    };

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
            className="rtpb-pro-badge"
        >
            <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="rtpb-pro-badge-icon"
            >
                <path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" />
            </svg>
            PRO
            <span className="rtpb-pro-badge-shine" />
        </span>
    );
}
