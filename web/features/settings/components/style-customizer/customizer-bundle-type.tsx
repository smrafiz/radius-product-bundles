"use client";

import {
    useScrollBlur,
    PreviewTemplateId,
    useCustomizerPage,
    useCustomizerStore,
} from "@/features/settings";
import { useSearchParams } from "next/navigation";
import { CustomizerHeader } from "./customizer-header";
import { CustomizerSkeleton } from "./customizer-skeletons";
import { DynamicCustomizerPanel } from "./dynamic-customizer-panel";
import { PreviewShell } from "./bundle-preview/preview-shell";
import { GlobalBanner } from "@/shared";
import { FormProvider } from "react-hook-form";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";
import { useTranslations } from "@/lib/i18n/provider";
import { useMemo } from "react";
import { CustomizerPanelConfig } from "@/features/settings";

function translateConfig(
    config: CustomizerPanelConfig,
    t: (key: string, defaultMessage?: string, ...args: any[]) => string,
): CustomizerPanelConfig {
    return {
        ...config,
        sections: config.sections.map((section) => {
            const translatedSection = { ...section };
            if (section.title) {
                translatedSection.title = t(
                    `section_${section.id}_title`,
                    undefined,
                    section.title,
                );
            }

            translatedSection.fields = section.fields.map((field, index) => {
                const translatedField = { ...field } as any;
                const fieldKeyPrefix = translatedField.name
                    ? `field_${translatedField.name}`
                    : `field_idx_${section.id}_${index}`;

                if (translatedField.label) {
                    translatedField.label = t(
                        `${fieldKeyPrefix}_label`,
                        undefined,
                        translatedField.label,
                    );
                }
                if (translatedField.details) {
                    translatedField.details = t(
                        `${fieldKeyPrefix}_details`,
                        undefined,
                        translatedField.details,
                    );
                }

                if (translatedField.options) {
                    translatedField.options = translatedField.options.map(
                        (opt: any) => ({
                            ...opt,
                            label: t(
                                `${fieldKeyPrefix}_option_${opt.value}`,
                                undefined,
                                opt.label,
                            ),
                        }),
                    );
                }

                return translatedField as any;
            });
            return translatedSection;
        }),
    };
}

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

    const { activeLayout, customizerSource } = useCustomizerStore();
    const activeBundleType = (activeId || "FIXED_BUNDLE") as PreviewTemplateId;

    const searchParams = useSearchParams();
    const bundleTypeParam = searchParams.get("bundleType");

    const availableTypes =
        customizerSource === "bundle-preview" && bundleTypeParam
            ? [bundleTypeParam as PreviewTemplateId]
            : undefined;

    const t = useTranslations("Settings.Customizer");
    const tConfig = useTranslations("Settings.Customizer.Config");
    const translatedConfig = useMemo(
        () => translateConfig(CUSTOMIZER_CONFIG, tConfig as any),
        [tConfig],
    );

    const leftPanelScroll = useScrollBlur();
    const rightPanelScroll = useScrollBlur();

    return (
        <s-page heading={t("heading")} inlineSize="large">
            <s-button
                slot="primary-action"
                variant="primary"
                disabled={!isDirty || isSaving}
                loading={isSaving}
                onClick={() => handleSubmit()}
            >
                {t("save")}
            </s-button>
            {isDirty && (
                <s-button
                    slot="secondary-actions"
                    onClick={handleReset}
                    disabled={isSaving}
                >
                    {t("discard")}
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
                                        config={translatedConfig}
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
                                        availableTypes={availableTypes}
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
