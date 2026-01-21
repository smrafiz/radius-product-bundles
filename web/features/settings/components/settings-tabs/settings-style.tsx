"use client";

import { CustomizerModal } from "@/features/settings";

/**
 * Style settings component
 */
export function SettingsStyle() {
    return (
        <s-stack gap="large">
            {/* Style Customizer Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Style Customizer</s-heading>
                        <s-tooltip id="style-customizer-tooltip">
                            <s-text>
                                Set global colors, typography, and styling for
                                all bundle widgets.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="style-customizer-tooltip"
                        />
                    </s-stack>

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
