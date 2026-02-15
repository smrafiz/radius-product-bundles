"use client";

import type { CheckIndicatorProps } from "@/features/settings";

export function CheckIndicator({
    checked,
    color,
    borderColor,
    variant,
}: CheckIndicatorProps) {
    return (
        <div
            style={{
                width: "18px",
                height: "18px",
                borderRadius: variant === "radio" ? "50%" : "4px",
                border: `2px solid ${checked ? color : borderColor}`,
                backgroundColor: checked ? color : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
            }}
        >
            {checked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                        d="M2 5L4 7L8 3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );
}
