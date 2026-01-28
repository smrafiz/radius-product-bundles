"use client";

import {
    BundlePreviewBogo,
    BundlePreviewBuyGet,
    BundlePreviewFixed,
    CustomizerHeader,
    DynamicCustomizerPanel,
    useCustomizerPage,
} from "@/features/settings";
import { GlobalBanner } from "@/shared";
import type { ComponentType } from "react";
import { FormProvider } from "react-hook-form";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";

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
        setActiveId,
        triggerSaveBar,
        handleSubmit,
        handleReset,
    } = useCustomizerPage();

    const PreviewComponent = activeId ? BUNDLE_PREVIEW_MAP[activeId] : null;

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
                disabled={!isDirty || isSaving}
                loading={isSaving}
            >
                Save
            </s-button>

            <s-stack paddingBlock="base large-300">
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

                        <div className="rtpb-full-modal-editor">
                            <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                                <div className="rtpb-left-setting">
                                    <div className="sticky top-0">
                                        <DynamicCustomizerPanel
                                            config={CUSTOMIZER_CONFIG}
                                            onFieldChangeAction={triggerSaveBar}
                                        />
                                    </div>
                                </div>

                                <div className="rtpb-right-review">
                                    <s-stack gap="base">
                                        <GlobalBanner />
                                        <CustomizerHeader
                                            activeBundleType={activeId}
                                            onBundleTypeChangeAction={
                                                setActiveId
                                            }
                                        />

                                        {PreviewComponent ? (
                                            <PreviewComponent />
                                        ) : (
                                            <s-text>
                                                No preview available
                                            </s-text>
                                        )}
                                    </s-stack>
                                </div>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </s-stack>
        </s-page>
    );
}
