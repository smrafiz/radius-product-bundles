"use client";
import React from "react";
import { SettingsFaqItemInfo } from "@/features/settings";

interface SettingsFaqItemProps extends SettingsFaqItemInfo {
    expanded: boolean;
    onToggle: () => void;
}

export function SettingsFaqItem({
    id,
    title,
    description,
    expanded,
    onToggle,
}: SettingsFaqItemProps) {
    return (
        <s-box key={id} borderWidth="small" overflow="hidden">
            <s-clickable onClick={onToggle} aria-expanded={expanded}>
                <s-box padding="base" background="subdued">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>{title}</s-heading>
                        <s-icon
                            type={expanded ? "chevron-up" : "chevron-down"}
                        />
                    </s-stack>
                </s-box>
            </s-clickable>

            <div
                style={{
                    display: "grid",
                    gridTemplateRows: expanded ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    <s-box padding="base">{description}</s-box>
                </div>
            </div>
        </s-box>
    );
}
