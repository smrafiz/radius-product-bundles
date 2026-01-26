"use client";

import { RefObject } from "react";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import {
    BundleOptionsBadge,
    BundleOptionsBox,
    BundleOptionsButton,
    BundleOptionsGeneral,
    BundleOptionsHeading,
    BundleOptionsImage,
    BundleOptionsProduct,
} from "@/features/settings";

interface BundleOptionTypeProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Left panel with all style option sections.
 *
 * Passes formRef to child components so they can trigger
 * form input events for the native data-save-bar.
 */
export function BundleOptionType({ formRef }: BundleOptionTypeProps) {
    const { resetToDefaults } = useCustomizer();

    /**
     * Handles restore defaults with form change trigger.
     */
    const handleRestoreDefaults = () => {
        resetToDefaults();
        // Trigger form change event for save bar
        if (formRef?.current) {
            formRef.current.dispatchEvent(
                new Event("input", { bubbles: true }),
            );
        }
    };

    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                <BundleOptionsGeneral formRef={formRef} />
                <BundleOptionsBox formRef={formRef} />
                <BundleOptionsBadge formRef={formRef} />
                <BundleOptionsHeading formRef={formRef} />
                <BundleOptionsProduct formRef={formRef} />
                <BundleOptionsButton formRef={formRef} />
                <BundleOptionsImage formRef={formRef} />
            </s-stack>
            <s-stack padding="base">
                <s-button icon="undo" onClick={handleRestoreDefaults}>
                    Restore defaults
                </s-button>
            </s-stack>
        </div>
    );
}
