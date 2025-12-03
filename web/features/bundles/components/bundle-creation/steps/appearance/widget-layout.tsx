"use client";

import { useBundleStore, WIDGET_LAYOUTS } from "@/features/bundles";
import React from "react";

export function WidgetLayout() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Widget Layout</s-heading>
                    <s-tooltip id="widget-layout-tooltip">
                        <s-text>
                            Select the layout for your bundle widget to display.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="widget-layout-tooltip"
                    />
                </s-stack>

                <s-stack gap="small">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(110px, 1fr))"
                        gap="base"
                    >
                        {WIDGET_LAYOUTS.map(
                            ({ label, widgetLayout, value }) => {
                                const tooltipId = `layout-tooltip-${value}`;

                                return (<s-grid-item key={value} gridColumn="auto">
                                    <s-stack gap="small">
                                        <s-tooltip id={tooltipId}>
                                            <s-text>{label}</s-text>
                                        </s-tooltip>
                                        <div
                                            className={`flex items-center justify-between border-2 rounded-xl w-full h-[100px] p-2.5 transition duration-200 cursor-pointer ${displaySettings.layout === value ? "border-blue-600 bg-[var(--p-color-bg-surface-secondary)]" : "border-gray-50 bg-[var(--p-color-bg-surface-secondary)] hover:border-blue-600"}`}
                                            onClick={() =>
                                                updateDisplaySettings(
                                                    "layout",
                                                    value,
                                                )
                                            }
                                        >
                                            <s-link
                                                accessibilityLabel={label}
                                                interestFor={tooltipId}
                                            >
                                                <s-image
                                                    src={widgetLayout}
                                                    alt={label}
                                                />
                                            </s-link>
                                        </div>
                                    </s-stack>
                                </s-grid-item>);
                            },
                        )}
                    </s-grid>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
