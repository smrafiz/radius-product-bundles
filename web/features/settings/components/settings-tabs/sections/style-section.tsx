"use client";

import { CustomizerModal, SectionHeader } from "@/features/settings";

/**
 * Renders the style section with customizer modal.
 */
export function StyleSection() {
    return (
        <s-stack gap="large">
            <s-section>
                <s-stack gap="base">
                    <SectionHeader
                        id="style-customizer"
                        title="Style Customizer"
                        tooltip="Set global colors, typography, and styling for all bundle widgets."
                    />
                    <s-text tone="neutral">
                        Customize colors, typography, buttons, badges, and more.
                        These styles apply to all bundle widgets and can be
                        overridden per-page in the Theme Editor.
                    </s-text>
                    <CustomizerModal />
                </s-stack>
            </s-section>
        </s-stack>
    );
}
