"use client";

import type { ComponentType } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BUNDLE_TYPES } from "@/features/bundles";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

import {
    BundlePreviewBogo,
    BundlePreviewBuyGet,
    BundlePreviewFixed,
    CustomizerHeader,
    CustomizerStyles,
    DynamicCustomizerPanel,
    globalStylesSchema,
    useCustomizer,
    useCustomizerSubmit,
    useSettingsQuery,
} from "@/features/settings";

export const BUNDLE_PREVIEW_MAP: Record<string, ComponentType> = {
    FIXED_BUNDLE: BundlePreviewFixed,
    BUY_X_GET_Y: BundlePreviewBuyGet,
    BOGO: BundlePreviewBogo,
};

/**
 * Main customizer page component.
 *
 * Uses React Hook Form with Zod validation.
 * Syncs with Zustand store for live preview.
 * Uses native data-save-bar for Shopify SaveBar.
 */
export function CustomizerBundleType() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState<string>(types[0].id);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    // Fetch settings
    const { data: settingsData, isLoading } = useSettingsQuery();

    // Zustand store for live preview
    const { initializeStyles, discardChanges } = useCustomizer();

    // Submit handler
    const { handleSubmit: submitToServer, isLoading: isSaving } =
        useCustomizerSubmit();

    // Merge defaults with saved values
    const defaultValues: CustomizerStyles = {
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(settingsData?.globalStyles || {}),
    };

    // Initialize RHF with Zod resolver
    const form = useForm<CustomizerStyles>({
        resolver: zodResolver(globalStylesSchema),
        defaultValues,
        mode: "onChange",
    });

    // Initialize Zustand store when settings load
    useEffect(() => {
        if (settingsData) {
            initializeStyles(settingsData.globalStyles || {});
        }
    }, [settingsData, initializeStyles]);

    /**
     * Triggers save bar by changing hidden input value.
     */
    const triggerSaveBar = useCallback(() => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = Date.now().toString();
            hiddenInputRef.current.dispatchEvent(
                new Event("input", { bubbles: true }),
            );
        }
    }, []);

    /**
     * Handles form submission with RHF validation.
     */
    const onSubmit = form.handleSubmit(async () => {
        await submitToServer();
    });

    /**
     * Handles form reset (discard).
     */
    const onReset = () => {
        form.reset(defaultValues);
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

            <FormProvider {...form}>
                <form
                    id="customizer-form"
                    data-save-bar
                    data-discard-confirmation
                    onSubmit={onSubmit}
                    onReset={onReset}
                    style={{ display: "contents" }}
                >
                    {/* Hidden input for SaveBar dirty state */}
                    <input
                        ref={hiddenInputRef}
                        type="hidden"
                        name="_dirty"
                        defaultValue=""
                    />

                    <div className="rtpb-full-modal-editor">
                        <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                            {/* Left: Style Options */}
                            <div className="rtpb-left-setting">
                                <div className="sticky top-0">
                                    <DynamicCustomizerPanel
                                        config={CUSTOMIZER_CONFIG}
                                        onFieldChange={triggerSaveBar}
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
            </FormProvider>
        </s-page>
    );
}
