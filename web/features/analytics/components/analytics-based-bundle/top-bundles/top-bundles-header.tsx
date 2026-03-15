import { getDateRangeLabel, useAnalyticsStore } from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Top Bundles Header
 */
export function TopBundlesHeader() {
    const t = useTranslations("Analytics.TopBundles");
    const { startDate, endDate } = useAnalyticsStore();

    const dateLabel = getDateRangeLabel(startDate, endDate);

    return (
        <s-box padding="base" border="base" borderStyle="none none solid none">
            <s-stack
                gap="small-200"
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
            >
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-heading>{t("heading")}</s-heading>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="top-bundle-tooltip"
                    />
                    <s-tooltip id="top-bundle-tooltip">
                        <s-text>
                            {t("tooltip")}
                        </s-text>
                    </s-tooltip>
                </s-stack>
                {/* Date range indicator */}
                {dateLabel && (
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#008CFF" }}
                        />
                        <s-text tone="info">
                            <span className="text-[11px] text-[#70707b]">
                                {dateLabel}
                            </span>
                        </s-text>
                    </s-stack>
                )}
            </s-stack>
        </s-box>
    );
}
