"use client";

import { CustomizerPanelConfig, DynamicCustomizerSection, useCustomizerPanel, } from "@/features/settings";

/**
 * Main customizer panel renderer.
 */
export function DynamicCustomizerPanel({
    config,
    onFieldChangeAction,
}: {
    config: CustomizerPanelConfig;
    onFieldChangeAction?: () => void;
}) {
    const { handleRestoreDefaults } = useCustomizerPanel(onFieldChangeAction);

    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                {config.sections.map((section) => (
                    <DynamicCustomizerSection
                        key={section.id}
                        config={section}
                        onFieldChangeAction={onFieldChangeAction}
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
