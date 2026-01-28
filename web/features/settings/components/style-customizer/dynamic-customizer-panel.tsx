"use client";

import { useModalStore } from "@/shared";
import { CustomizerPanelConfig, DynamicCustomizerSection, useCustomizerPanel } from "@/features/settings";

export function DynamicCustomizerPanel({
    config,
    onFieldChangeAction,
    resetKey = 0,
}: {
    config: CustomizerPanelConfig;
    onFieldChangeAction?: () => void;
    resetKey?: number;
}) {
    const { openSectionId, handleToggle, handleRestoreDefaults } =
        useCustomizerPanel(config, onFieldChangeAction);
    const { openModal } = useModalStore();

    const handleRestoreClick = () => {
        openModal({
            type: "restore-defaults",
            confirmText: "Restore",
            onConfirm: handleRestoreDefaults,
        });
    };

    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                {config.sections.map((section) => (
                    <DynamicCustomizerSection
                        key={section.id}
                        config={section}
                        isOpen={openSectionId === section.id}
                        onToggleAction={() => handleToggle(section.id)}
                        onFieldChangeAction={onFieldChangeAction}
                        resetKey={resetKey}
                    />
                ))}
            </s-stack>
            <s-stack padding="base" justifyContent="center" direction="inline">
                <s-button icon="undo" tone="critical" onClick={handleRestoreClick}>
                    Restore defaults
                </s-button>
            </s-stack>
        </div>
    );
}
