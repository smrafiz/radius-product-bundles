"use client";

import { useBundleStore, WIDGET_POSITIONS } from "@/features/bundles";

export function WidgetPosition() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    function handlePositionChange(value: string) {
        updateDisplaySettings("position", value as any);
    }

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    Widget Position
                </s-heading>

                <s-select
                    label="Display Position"
                    details="Choose where the bundle widget appears on product pages"
                    required
                    value={displaySettings.position}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLSelectElement;
                        handlePositionChange(target.value);
                    }}
                >
                    {WIDGET_POSITIONS.map((option) => (
                        <s-option key={option.value} value={option.value}>
                            {option.label}
                        </s-option>
                    ))}
                </s-select>
            </s-stack>
        </s-section>
    );
}
