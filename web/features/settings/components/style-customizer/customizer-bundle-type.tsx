"use client";

import {
    BundlePreviewBogo,
    BundlePreviewBuyGet,
    BundlePreviewFixed,
    CustomizerHeader,
    DynamicCustomizerPanel,
    GlobalStylesFormData,
    useCustomizer,
    useCustomizerSubmit,
    useSettingsQuery,
} from "@/features/settings";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";
import { BUNDLE_TYPES } from "@/features/bundles/constants/bundle-types.constants";

/*
 * Preview components for different bundle types.
 */
export const BUNDLE_PREVIEW_MAP: Record<string, ComponentType> = {
    FIXED_BUNDLE: BundlePreviewFixed,
    BUY_X_GET_Y: BundlePreviewBuyGet,
    BOGO: BundlePreviewBogo,
};

/**
 * Main customizer page component.
 */
export function CustomizerBundleType() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState<string>(types[0].id);
    const formRef = useRef<HTMLFormElement>(null);

    const { data: settingsData, isLoading } = useSettingsQuery();
    const { initializeFromGlobalStyles, isInitialized, discardChanges } =
        useCustomizer();
    const { handleSubmit, isLoading: isSaving } = useCustomizerSubmit();

    // Initialize customizer when settings are loaded
    useEffect(() => {
        if (settingsData && !isInitialized) {
            initializeFromGlobalStyles(
                settingsData.globalStyles as GlobalStylesFormData | undefined,
            );
        }
    }, [settingsData, isInitialized, initializeFromGlobalStyles]);

    /**
     * Handles form submission.
     */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit();
    };

    /**
     * Handles form reset (discard).
     * Restores the customizer store to the original saved values.
     */
    const onReset = (e: React.FormEvent) => {
        e.preventDefault();
        discardChanges();
    };

    const PreviewComponent = activeId ? BUNDLE_PREVIEW_MAP[activeId] : null;

    // Show loading while fetching settings
    if (isLoading) {
        return (
            <s-page heading="Style Customizer">
                <div className="flex items-center justify-center min-h-100">
                    <s-spinner />
                </div>
            </s-page>
        );
    }

    return (
        <s-page heading="Style Customizer" inlineSize="large">
            <s-button
                slot="primary-action"
                type="submit"
                disabled={isSaving}
                loading={isSaving}
            >
                Save
            </s-button>

            <form
                id="customizer-form"
                ref={formRef}
                data-save-bar
                onSubmit={onSubmit}
                onReset={onReset}
            >
                <div className="rtpb-full-modal-editor">
                    <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                        {/* Left: Config-based Style Options */}
                        <div className="rtpb-left-setting">
                            <div className="sticky top-0">
                                <DynamicCustomizerPanel
                                    config={CUSTOMIZER_CONFIG}
                                    formRef={formRef}
                                />
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="rtpb-right-review">
                            <s-stack gap="base">
                                <CustomizerHeader
                                    activeBundleType={activeId}
                                    onBundleTypeChange={setActiveId}
                                />

                                {PreviewComponent ? (
                                    <PreviewComponent />
                                ) : (
                                    <s-text>No preview available</s-text>
                                )}
                            </s-stack>
                        </div>
                    </div>
                </div>
            </form>
        </s-page>
    );
}
