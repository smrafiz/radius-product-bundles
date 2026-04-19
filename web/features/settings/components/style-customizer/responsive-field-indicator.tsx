"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { useCrossSellStore, usePlan } from "@/shared";
import { ResponsiveFieldIndicatorProps } from "@/features/settings";

export function ResponsiveFieldIndicator({
    activeDevice,
    isInherited,
    onOverride,
    onClearOverride,
}: ResponsiveFieldIndicatorProps) {
    const t = useTranslations("Settings.Customizer");
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const canResponsive = canUse("responsive_overrides");

    if (activeDevice === "desktop") {
        return null;
    }

    const deviceLabel =
        activeDevice.charAt(0).toUpperCase() + activeDevice.slice(1);

    if (!canResponsive) {
        return (
            <button
                type="button"
                onClick={() => openCrossSell(t("responsiveOverrides"))}
                className="inline-flex items-center gap-0.5 opacity-30 hover:opacity-50 transition-opacity cursor-pointer bg-transparent border-0 p-0"
                aria-label={`Responsive overrides (Pro)`}
            >
                <s-icon
                    type={activeDevice === "tablet" ? "tablet" : "mobile"}
                />
            </button>
        );
    }

    if (isInherited) {
        return (
            <s-text interestFor={`responsive-inherit-${activeDevice}`}>
                <s-stack direction="inline" alignItems="center" gap="small-200">
                    <button
                        type="button"
                        onClick={onOverride}
                        className="inline-flex items-center gap-0.5 text-[#616161] hover:text-[#303030] transition-colors cursor-pointer bg-transparent border-0 p-0"
                        aria-label={`Customize for ${deviceLabel}`}
                    >
                        <s-icon
                            type={
                                activeDevice === "tablet" ? "tablet" : "mobile"
                            }
                        />
                    </button>
                </s-stack>
                <s-tooltip id={`responsive-inherit-${activeDevice}`}>
                    <s-text>
                        {t("responsive.inheritTooltip", {
                            deviceLabel: deviceLabel,
                        })}
                    </s-text>
                </s-tooltip>
            </s-text>
        );
    }

    return (
        <s-text interestFor={`responsive-override-${activeDevice}`}>
            <s-stack direction="inline" alignItems="center" gap="small-200">
                <button
                    type="button"
                    onClick={onClearOverride}
                    className="inline-flex items-center gap-0.5 text-[#0094d5] hover:text-[#0094d5] transition-colors cursor-pointer bg-transparent border-0 p-0"
                    aria-label={`Reset to Desktop value`}
                >
                    <s-icon
                        type={activeDevice === "tablet" ? "tablet" : "mobile"}
                    />
                </button>
                <s-tooltip id={`responsive-override-${activeDevice}`}>
                    <s-text>
                        {t("responsive.overrideTooltip", {
                            deviceLabel: deviceLabel,
                        })}
                    </s-text>
                </s-tooltip>
            </s-stack>
        </s-text>
    );
}
