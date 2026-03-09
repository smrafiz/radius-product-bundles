"use client";

import {
    useScrollBlur,
    PreviewTemplateId,
    useCustomizerPage,
    useCustomizerStore,
} from "@/features/settings";
import { CustomizerHeader } from "./customizer-header";
import { CustomizerSkeleton } from "./customizer-skeletons";
import { DynamicCustomizerPanel } from "./dynamic-customizer-panel";
import { PreviewShell } from "./bundle-preview/preview-shell";
import { GlobalBanner } from "@/shared";
import { FormProvider } from "react-hook-form";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";

export function CustomizerBundleType() {
    const {
        form,
        activeId,
        isLoading,
        isSaving,
        isDirty,
        resetCounter,
        setActiveId,
        handleClearErrors,
        handleSubmit,
        handleReset,
    } = useCustomizerPage();

    const { activeLayout } = useCustomizerStore();
    const activeBundleType = (activeId || "FIXED_BUNDLE") as PreviewTemplateId;

    const leftPanelScroll = useScrollBlur();
    const rightPanelScroll = useScrollBlur();

    return (
        <s-page
            heading="Global Customizer - Manage Bundle Styles"
            inlineSize="large"
        >
            <s-button
                slot="primary-action"
                variant="primary"
                disabled={!isDirty || isSaving}
                loading={isSaving}
                onClick={() => handleSubmit()}
            >
                Save
            </s-button>
            {isDirty && (
                <s-button
                    slot="secondary-actions"
                    onClick={handleReset}
                    disabled={isSaving}
                >
                    Discard
                </s-button>
            )}

            {isLoading ? (
                <CustomizerSkeleton />
            ) : (
                <s-stack paddingBlock="base large-300">
                    <div className="rtpb-full-modal-editor">
                        <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                            <div
                                ref={leftPanelScroll.containerRef}
                                className="rtpb-left-setting"
                            >
                                <div className="rtpb-blur-top" />
                                <FormProvider {...form}>
                                    <DynamicCustomizerPanel
                                        config={CUSTOMIZER_CONFIG}
                                        onClearErrorsAction={handleClearErrors}
                                        onAccordionChange={
                                            leftPanelScroll.handleAccordionChange
                                        }
                                        resetKey={resetCounter}
                                        activeLayout={activeLayout}
                                        activeBundleType={activeBundleType}
                                    />
                                </FormProvider>
                                <div className="rtpb-blur-bottom" />
                            </div>

                            <div className="rtpb-right-review">
                                <div className="rtpb-right-header">
                                    <GlobalBanner />
                                    <CustomizerHeader
                                        activeBundleType={activeId}
                                        onBundleTypeChangeAction={setActiveId}
                                    />
                                </div>
                                <PreviewShell
                                    bundleType={activeBundleType}
                                    scrollRef={rightPanelScroll.containerRef}
                                />
                            </div>
                        </div>
                    </div>
                </s-stack>
            )}
        </s-page>
    );
}
