"use client";

import {
    CustomizerPanelConfig,
    DynamicCustomizerSection,
    useCustomizer,
} from "@/features/settings";

interface DynamicCustomizerPanelProps {
    config: CustomizerPanelConfig;
    onFieldChange?: () => void;
}

/**
 * Main customizer panel renderer.
 *
 * Renders all sections with a restore defaults button.
 */
export function DynamicCustomizerPanel({
    config,
    onFieldChange,
}: DynamicCustomizerPanelProps) {
    const { resetToDefaults } = useCustomizer();

    /**
     * Handles restore defaults with field change trigger.
     */
    const handleRestoreDefaults = () => {
        resetToDefaults();
        onFieldChange?.();
    };

    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                {config.sections.map((section) => (
                    <DynamicCustomizerSection
                        key={section.id}
                        config={section}
                        onFieldChange={onFieldChange}
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
