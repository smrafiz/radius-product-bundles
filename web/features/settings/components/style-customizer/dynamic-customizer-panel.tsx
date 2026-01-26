"use client";

import { RefObject } from "react";
import { CustomizerPanelConfig, DynamicCustomizerSection, useCustomizer } from "@/features/settings";

/**
 * Main customizer panel renderer.
 *
 * Renders all sections with a restore defaults button.
 */
export function DynamicCustomizerPanel({
    config,
    formRef,
}: {
    config: CustomizerPanelConfig;
    formRef?: RefObject<HTMLFormElement | null>;
}) {
    const { resetToDefaults } = useCustomizer();

    /**
     * Handles restore defaults with form change trigger.
     */
    const handleRestoreDefaults = () => {
        resetToDefaults();
        // Trigger form change event for save bar
        formRef?.current?.dispatchEvent(new Event("input", { bubbles: true }));
    };

    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                {config.sections.map((section) => (
                    <DynamicCustomizerSection
                        key={section.id}
                        config={section}
                        formRef={formRef}
                    />
                ))}
            </s-stack>
            <s-stack padding="base">
                <s-button icon="undo" onClick={handleRestoreDefaults}>
                    Restore defaults
                </s-button>
            </s-stack>
        </div>
    );
}
