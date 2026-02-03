"use client";

import type { SectionLabelProps } from "@/features/settings";

export function SectionLabel({
    children,
    color,
    opacity = 1,
}: SectionLabelProps) {
    return (
        <div
            style={{
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color,
                opacity,
                paddingBottom: "4px",
            }}
        >
            {children}
        </div>
    );
}
