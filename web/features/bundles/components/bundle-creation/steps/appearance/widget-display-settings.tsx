"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { ADVANCED_OPTIONS, useBundleStore } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared";

export function WidgetDisplaySettings() {
    const t = useTranslations("Bundles.Creation.Appearance");
    const td = useTranslations("Bundles.DetailsConstants.displaySettings");
    const { displaySettings, updateDisplaySettings, markFieldTouched, bundleData } =
        useBundleStore(
            useShallow((s) => ({
                displaySettings: s.displaySettings,
                updateDisplaySettings: s.updateDisplaySettings,
                markFieldTouched: s.markFieldTouched,
                bundleData: s.bundleData,
            })),
        );
    const { setValue } = useFormContext();
    const { canUse } = usePlan();

    const visibleOptions = useMemo(() => {
        return ADVANCED_OPTIONS.filter(({ key }) => {
            if (key === "showFreeShipping") {
                return canUse("bundle_behavior") && bundleData.freeShipping;
            }
            return true;
        });
    }, [canUse, bundleData.freeShipping]);

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
                        <s-text>{t("displayTooltip")}</s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="product-page-settings-display-tooltip"
                    />
                </s-stack>
                {visibleOptions.map(({ key }, index) => {
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
                            {index < visibleOptions.length - 1 && (
                                <s-divider />
                            )}
                        </s-stack>
                    );
                })}
            </s-stack>
        </s-section>
    );
}
