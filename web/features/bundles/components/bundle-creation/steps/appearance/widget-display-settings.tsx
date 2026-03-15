"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { ADVANCED_OPTIONS, useBundleStore } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

export function WidgetDisplaySettings() {
    const t = useTranslations("Bundles.Creation.Appearance");
    const td = useTranslations("Bundles.DetailsConstants.displaySettings");
    const { displaySettings, updateDisplaySettings, markFieldTouched } =
        useBundleStore();
    const { setValue } = useFormContext();

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{t("displayHeading")}</s-heading>
                    <s-tooltip id="product-page-settings-display-tooltip">
                        <s-text>
                            {t("displayTooltip")}
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="product-page-settings-display-tooltip"
                    />
                </s-stack>
                {ADVANCED_OPTIONS.map(({ key }, index) => {
                    const selected = displaySettings[key];
                    return (
                        <s-stack key={key} gap="base">
                            <s-switch
                                label={td(key + ".label")}
                                details={td(key + ".details")}
                                checked={selected}
                                onInput={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                    updateDisplaySettings(key, target.checked);
                                    setValue(
                                        `settings.${key}`,
                                        target.checked,
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        },
                                    );
                                    markFieldTouched(`settings.${key}`);
                                }}
                            />
                            {index < ADVANCED_OPTIONS.length - 1 && (
                                <s-divider />
                            )}
                        </s-stack>
                    );
                })}
            </s-stack>
        </s-section>
    );
}
