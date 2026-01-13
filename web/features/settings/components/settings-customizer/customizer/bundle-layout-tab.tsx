"use client";

import { useBundleStore, WIDGET_LAYOUTS } from "@/features/bundles";
import React from "react";

export function BundleLayoutTab() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <s-section>
            <s-stack gap="small" direction="inline">
                {WIDGET_LAYOUTS.map(
                    ({ label, value }) => {
                        return (
                            <s-stack key={value} gap="small" >
                                <div
                                    className={`flex items-center justify-between border-1 rounded-md px-5 py-2 transition duration-200 cursor-pointer ${displaySettings.layout === value ? "border-gray-500 bg-[var(--p-color-bg-surface-secondary)]" : "border-gray-50 bg-[var(--p-color-bg-surface-secondary)] hover:border-gray-500"}`}
                                    onClick={() =>
                                        updateDisplaySettings(
                                            "layout",
                                            value,
                                        )
                                    }
                                >
                                    <s-text>{label}</s-text>
                                </div>
                            </s-stack>
                        );
                    },
                )}
            </s-stack>
        </s-section>
    );
}
