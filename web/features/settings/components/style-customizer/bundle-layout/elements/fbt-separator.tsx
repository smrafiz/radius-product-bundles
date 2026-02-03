"use client";

import type { FbtSeparatorProps } from "@/features/settings";

export function FbtSeparator({
    style: sepStyle,
    primaryColor,
    borderColor,
}: FbtSeparatorProps) {
    if (sepStyle === "none") return null;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: "0 4px",
            }}
        >
            {sepStyle === "plus" ? (
                <div
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: primaryColor,
                        lineHeight: 1,
                    }}
                >
                    +
                </div>
            ) : (
                <div
                    style={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: borderColor,
                    }}
                />
            )}
        </div>
    );
}
