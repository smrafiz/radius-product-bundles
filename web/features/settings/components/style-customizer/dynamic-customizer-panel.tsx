"use client";

import {
    ConditionContext,
    createConditionContext,
    DynamicCustomizerPanelProps,
    getVisibleSections,
    useCustomizerPanel,
    useCustomizerStore,
} from "@/features/settings";
import { DynamicCustomizerSection } from "./dynamic-customizer-section";
import { useModalStore } from "@/shared";
import { useEffect, useMemo, useRef } from "react";

/**
 * Dynamic customizer panel with conditional section visibility.
 */
export function DynamicCustomizerPanel({
    config,
    onFieldChangeAction,
    onClearErrorsAction,
    onAccordionChange,
    resetKey = 0,
    activeLayout = "LIST",
    activeBundleType = "FIXED_BUNDLE",
}: DynamicCustomizerPanelProps) {
    const { styles, activeDevice } = useCustomizerStore();
    const {
        openSectionId,
        setOpenSectionId,
        handleToggle,
        handleRestoreDefaults,
    } = useCustomizerPanel(config, onFieldChangeAction, onClearErrorsAction);

    useEffect(() => {
        onAccordionChange?.(openSectionId !== null);
    }, [openSectionId, onAccordionChange]);

    const { openModal } = useModalStore();

    // Create condition context
    const context: ConditionContext = useMemo(
        () =>
            createConditionContext(
                styles,
                activeLayout,
                activeBundleType,
                activeDevice,
            ),
        [styles, activeLayout, activeBundleType, activeDevice],
    );

    // Filter visible sections based on conditions
    const visibleSections = getVisibleSections(config.sections, context);

    // Auto-open first visible section when template type changes
    const prevBundleType = useRef(activeBundleType);
    useEffect(() => {
        if (prevBundleType.current !== activeBundleType) {
            prevBundleType.current = activeBundleType;
            const firstVisible = visibleSections[0];
            if (firstVisible) {
                setOpenSectionId(firstVisible.id);
            }
        }
    }, [activeBundleType, visibleSections, setOpenSectionId]);

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
