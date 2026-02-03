"use client";

import type { SectionDividerProps } from "@/features/settings";

export function SectionDivider({
    label,
    color,
    borderColor,
    opacity,
}: SectionDividerProps) {
    if (label === undefined) {
        return (
            <div
                style={{
                    height: "1px",
                    backgroundColor: borderColor,
                    margin: "4px 0",
                }}
            />
        );
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "4px 0",
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: borderColor,
                }}
            />
            <div
                style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color,
                    opacity,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </div>
            <div
                style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: borderColor,
                }}
            />
        </div>
    );
}
