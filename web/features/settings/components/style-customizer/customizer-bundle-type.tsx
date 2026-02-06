"use client";

import {
    CustomizerHeader,
    CustomizerSkeleton,
    DynamicCustomizerPanel,
    PreviewShell,
    PreviewTemplateId,
    useCustomizerPage,
    useCustomizerStore,
} from "@/features/settings";
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
        hiddenInputRef,
        resetCounter,
        setActiveId,
        triggerSaveBar,
        handleClearErrors,
        handleSubmit,
        handleReset,
    } = useCustomizerPage();

    const { activeLayout } = useCustomizerStore();
    const activeBundleType = (activeId || "FIXED_BUNDLE") as PreviewTemplateId;

    return (
        <s-page heading="Customizer - Manage Bundle Styles" inlineSize="large">
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

                                    <PreviewShell
                                        bundleType={activeBundleType}
                                    />
                                </s-stack>
                            </div>
                        </div>
                    </div>
                </s-stack>
            )}
        </s-page>
    );
}
