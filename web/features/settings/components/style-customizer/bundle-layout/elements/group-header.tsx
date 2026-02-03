"use client";

import { GroupHeaderProps, useCustomizerStore } from "@/features/settings";

export function GroupHeader({ name, min, max, color }: GroupHeaderProps) {
    const { styles } = useCustomizerStore();

    return (
        <div
            style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
            }}
        >
            <div
                style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color,
                }}
            >
                {name}
            </div>
            <div
                style={{
                    fontSize: "12px",
                    color: styles.textColor,
                    opacity: 0.6,
                }}
            >
                Pick {min}
                {max > min ? `–${max}` : ""}
            </div>
        </div>
    );
}
