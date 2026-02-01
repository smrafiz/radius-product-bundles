"use client";

import {
    BundlePreviewBogo,
    BundlePreviewBuyGet,
    BundlePreviewFixed,
    CustomizerHeader,
    CustomizerSkeleton,
    DynamicCustomizerPanel,
    useCustomizerPage,
    useCustomizerStore,
} from "@/features/settings";
import { GlobalBanner } from "@/shared";
import type { ComponentType } from "react";
import { FormProvider } from "react-hook-form";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";
import { BundleType } from "@/features/bundles";

/**
 * Map of bundle types to their preview components.
 */
const BUNDLE_PREVIEW_MAP: Record<string, ComponentType> = {
    FIXED_BUNDLE: BundlePreviewFixed,
    BUY_X_GET_Y: BundlePreviewBuyGet,
    BOGO: BundlePreviewBogo,
};

/**
 * Main customizer page component.
 *
 * Pure JSX renderer - all logic in useCustomizerPage hook.
 */
export function CustomizerBundleType() {
    const {
        form,
        activeId,
        isLoading,
        isSaving,
        isDirty,
        hiddenInputRef,
        resetCounter,
        setActiveId,
        triggerSaveBar,
        handleClearErrors,
        handleSubmit,
        handleReset,
    } = useCustomizerPage();

    const { activeLayout } = useCustomizerStore();
    const activeBundleType = (activeId || "FIXED_BUNDLE") as BundleType;
    const PreviewComponent = activeId ? BUNDLE_PREVIEW_MAP[activeId] : null;

    return (
        <s-page heading="Style Customizer" inlineSize="large">
            <s-button
                slot="primary-action"
                type="submit"
                disabled={!isDirty || isSaving}
                loading={isSaving}
            >
                Save
            </s-button>

            {isLoading ? (
                <CustomizerSkeleton />
            ) : (
                <s-stack paddingBlock="base large-300">
                    <div className="rtpb-full-modal-editor">
                        <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                            <div className="rtpb-left-setting">
                                <div className="sticky top-0">
                                    <FormProvider {...form}>
                                        <form
                                            id="customizer-form"
                                            data-save-bar
                                            data-discard-confirmation
                                            onSubmit={handleSubmit}
                                            onReset={handleReset}
                                            style={{ display: "contents" }}
                                        >
                                            <input
                                                ref={hiddenInputRef}
                                                type="hidden"
                                                name="_dirty"
                                                defaultValue=""
                                            />
                                            <DynamicCustomizerPanel
                                                config={CUSTOMIZER_CONFIG}
                                                onFieldChangeAction={
                                                    triggerSaveBar
                                                }
                                                onClearErrorsAction={
                                                    handleClearErrors
                                                }
                                                resetKey={resetCounter}
                                                activeLayout={activeLayout}
                                                activeBundleType={
                                                    activeBundleType
                                                }
                                            />
                                        </form>
                                    </FormProvider>
                                </div>
                            </div>

                            <div className="rtpb-right-review">
                                <s-stack gap="base">
                                    <GlobalBanner />
                                    <CustomizerHeader
                                        activeBundleType={activeId}
                                        onBundleTypeChangeAction={setActiveId}
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
                </s-stack>
            )}
        </s-page>
    );
}
