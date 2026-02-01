"use client";

import { useMemo } from "react";
import { useModalStore } from "@/shared";
import {
    ConditionContext,
    createConditionContext,
    CustomizerPanelConfig,
    DynamicCustomizerSection,
    getVisibleSections,
    useCustomizerPanel,
    useCustomizerStore,
} from "@/features/settings";
import { BundleType } from "@/features/bundles";
import { WidgetLayout } from "@/prisma/generated/enums";

interface DynamicCustomizerPanelProps {
    config: CustomizerPanelConfig;
    onFieldChangeAction?: () => void;
    onClearErrorsAction?: () => void;
    resetKey?: number;
    activeLayout?: WidgetLayout;
    activeBundleType?: BundleType;
}

/**
 * Dynamic customizer panel with conditional section visibility.
 */
export function DynamicCustomizerPanel({
    config,
    onFieldChangeAction,
    onClearErrorsAction,
    resetKey = 0,
    activeLayout = "LIST",
    activeBundleType = "FIXED_BUNDLE",
}: DynamicCustomizerPanelProps) {
    const { styles, activeDevice } = useCustomizerStore();
    const { openSectionId, handleToggle, handleRestoreDefaults } =
        useCustomizerPanel(config, onFieldChangeAction, onClearErrorsAction);
    const { openModal } = useModalStore();

    // Create condition context
    const context: ConditionContext = useMemo(
        () => createConditionContext(styles, activeLayout, activeBundleType, activeDevice),
        [styles, activeLayout, activeBundleType, activeDevice],
    );

    // Filter visible sections based on conditions
    const visibleSections = getVisibleSections(config.sections, context);

    /**
     * Opens restore defaults confirmation modal.
     */
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
                {visibleSections.map((section) => (
                    <DynamicCustomizerSection
                        key={section.id}
                        config={section}
                        context={context}
                        isOpen={openSectionId === section.id}
                        onToggleAction={() => handleToggle(section.id)}
                        onFieldChangeAction={onFieldChangeAction}
                        resetKey={resetKey}
                    />
                ))}
            </s-stack>
            <s-stack padding="base" justifyContent="center" direction="inline">
                <s-button
                    icon="undo"
                    tone="critical"
                    onClick={handleRestoreClick}
                >
                    Restore defaults
                </s-button>
            </s-stack>
        </div>
    );
}
