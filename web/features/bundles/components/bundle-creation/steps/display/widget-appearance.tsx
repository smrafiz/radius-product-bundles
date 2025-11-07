"use client";

import { useBundleStore } from "@/features/bundles";

export function WidgetAppearance() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    function handleTitleChange(event: Event) {
        const target = event.currentTarget as HTMLInputElement;
        updateDisplaySettings("title", target.value);
    }

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Appearance</s-heading>

                <s-text-field
                    label="Widget Title"
                    value={displaySettings.title || ''}
                    onChange={handleTitleChange}
                    details="Title displayed above the bundle"
                />

            </s-stack>
        </s-section>
    );
}
