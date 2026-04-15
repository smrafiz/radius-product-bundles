"use client";

import React, { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useBundleStore, useBundleValidation } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";

export function WidgetPosition() {
    const t = useTranslations("Bundles.Creation.Appearance");
    const { displaySettings, updateDisplaySettings, markFieldTouched } =
        useBundleStore(
            useShallow((s) => ({
                displaySettings: s.displaySettings,
                updateDisplaySettings: s.updateDisplaySettings,
                markFieldTouched: s.markFieldTouched,
            })),
        );
    const { getFieldError } = useBundleValidation();
    const { setValue, trigger } = useFormContext();

    const handleTitleChange = useCallback(
        (value: string) => {
            updateDisplaySettings("title", value);
            setValue("settings.title", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleSubtitleChange = useCallback(
        (value: string) => {
            updateDisplaySettings("subtitle", value);
            setValue("settings.subtitle", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleSubtitleBlur = useCallback(() => {
        markFieldTouched("settings.subtitle");
        void trigger("settings.subtitle");
    }, [markFieldTouched, trigger]);

    const handleCartButtonTextChange = useCallback(
        (value: string) => {
            updateDisplaySettings("cartButtonText", value);
            setValue("settings.cartButtonText", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleTitleBlur = useCallback(() => {
        markFieldTouched("settings.title");
        void trigger("settings.title");
    }, [markFieldTouched, trigger]);

    const handleCartButtonTextBlur = useCallback(() => {
        markFieldTouched("settings.cartButtonText");
        void trigger("settings.cartButtonText");
    }, [markFieldTouched, trigger]);

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{t("productPage")}</s-heading>
                    <s-tooltip id="product-page-display-tooltip">
                        <s-text>{t("productPageTooltip")}</s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="product-page-display-tooltip"
                    />
                </s-stack>

                <s-text-field
                    label={t("offerTitle")}
                    value={displaySettings.title || ""}
                    onInput={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        handleTitleChange(target.value);
                    }}
                    onBlur={handleTitleBlur}
                    error={getFieldError("settings.title")}
                    maxLength={100}
                    placeholder={t("titlePlaceholder")}
                />

                <s-text-area
                    label={t("offerSubtitle")}
                    value={displaySettings.subtitle || ""}
                    onInput={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        handleSubtitleChange(target.value);
                    }}
                    rows={3}
                    onBlur={handleSubtitleBlur}
                    error={getFieldError("settings.subtitle")}
                    maxLength={300}
                    placeholder={t("subtitlePlaceholder")}
                />

                <s-text-field
                    label={t("addToCartText")}
                    value={displaySettings.cartButtonText || ""}
                    onInput={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        handleCartButtonTextChange(target.value);
                    }}
                    onBlur={handleCartButtonTextBlur}
                    error={getFieldError("settings.cartButtonText")}
                    maxLength={50}
                    placeholder={t("cartButtonTextPlaceholder")}
                />
            </s-stack>
        </s-section>
    );
}
