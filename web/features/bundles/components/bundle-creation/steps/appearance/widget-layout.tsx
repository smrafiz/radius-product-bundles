"use client";

import { useBundleStore, WIDGET_LAYOUTS } from "@/features/bundles";

export function WidgetLayout() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Widget Layout</s-heading>

                <s-stack gap="small">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                        gap="base"
                    >
                        {WIDGET_LAYOUTS.map(
                            ({ label, widgetLayout, value }) => (
                                <s-grid-item key={value} gridColumn="auto">
                                    <s-stack gap="small">
                                        <div
                                            className={`flex items-center justify-between border-2 rounded-xl w-full h-[120px] p-2.5 transition duration-200 cursor-pointer ${ displaySettings.layout === value ? "border-blue-600 bg-[var(--p-color-bg-surface-secondary)]" : "border-gray-50 bg-[var(--p-color-bg-surface-secondary)] hover:border-blue-600" }`}
                                            onClick={() =>
                                                updateDisplaySettings(
                                                    "layout",
                                                    value,
                                                )
                                            }
                                        >
                                            <s-image
                                                src={widgetLayout}
                                                alt={label}
                                            />
                                        </div>
                                        <s-heading>{label}</s-heading>
                                    </s-stack>
                                </s-grid-item>
                            ),
                        )}
                    </s-grid>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
