"use client";

import { useMemo } from "react";
import { ProBadge, useCrossSellStore, usePlan } from "@/shared";
import { useBundleStore } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";
import {
    WIDGET_LAYOUTS,
    LAYOUTS_BY_BUNDLE_TYPE,
} from "@/features/bundles/constants/bundle-details.constants";

export function WidgetLayout() {
    const t = useTranslations("Bundles.Creation.Appearance");
    const tl = useTranslations("Bundles.DetailsConstants.layouts");
    const { displaySettings, updateDisplaySettings, bundleData } =
        useBundleStore(
            useShallow((s) => ({
                displaySettings: s.displaySettings,
                updateDisplaySettings: s.updateDisplaySettings,
                bundleData: s.bundleData,
            })),
        );
    const { plan } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const allLayouts = useMemo(
        () =>
            LAYOUTS_BY_BUNDLE_TYPE[bundleData.type as string] ?? WIDGET_LAYOUTS,
        [bundleData.type],
    );
    const allowedValues =
        plan.limits.allowedLayouts[
            bundleData.type as keyof typeof plan.limits.allowedLayouts
        ];

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{t("layoutHeading")}</s-heading>
                    <s-tooltip id="widget-layout-tooltip">
                        <s-text>{t("layoutTooltip")}</s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="widget-layout-tooltip"
                    />
                </s-stack>

                <s-stack gap="small">
                    <s-grid
                        gridTemplateColumns="repeat(4, minmax(110px, 1fr))"
                        gap="base"
                    >
                        {allLayouts.map(({ widgetLayout, value }) => {
                            const tooltipId = `layout-tooltip-${value}`;
                            const translatedLabel = tl(value);
                            const isLocked =
                                allowedValues &&
                                !allowedValues.includes(value);

                            return (
                                <s-grid-item key={value} gridColumn="auto">
                                    <s-stack>
                                        <s-tooltip id={tooltipId}>
                                            <s-text>{translatedLabel}</s-text>
                                        </s-tooltip>
                                        <div
                                            className={`relative flex items-center justify-between border rounded-xl w-full h-25 p-2.5 transition duration-200 ${
                                                isLocked
                                                    ? "rtpb-pro-locked cursor-default border-[#e3e3e3] bg-[#f1f1f1]"
                                                    : `cursor-pointer ${displaySettings.layout === value ? "border-blue-600 bg-[#f1f1f1]" : "border-[#e3e3e3] bg-[#f1f1f1] hover:border-blue-600 hover:-translate-y-1"}`
                                            }`}
                                            onClick={() => {
                                                if (isLocked) {
                                                    openCrossSell(translatedLabel);
                                                } else {
                                                    updateDisplaySettings(
                                                        "layout",
                                                        value,
                                                    );
                                                }
                                            }}
                                        >
                                            <s-link
                                                accessibilityLabel={
                                                    translatedLabel
                                                }
                                                interestFor={tooltipId}
                                            >
                                                <s-image
                                                    src={widgetLayout}
                                                    alt={translatedLabel}
                                                />
                                            </s-link>
                                            {isLocked && (
                                                <div className="absolute top-1 right-1">
                                                    <ProBadge
                                                        label={translatedLabel}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </s-stack>
                                </s-grid-item>
                            );
                        })}
                    </s-grid>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
