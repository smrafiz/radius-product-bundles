import { getDateRangeLabel, useAnalyticsStore } from "@/features/analytics";

/**
 * Top Bundles Header
 */
export function TopBundlesHeader() {
    const { startDate, endDate } = useAnalyticsStore();

    const dateLabel = getDateRangeLabel(startDate, endDate);

    return (
        <s-box padding="base" border="base" borderStyle="none none solid none">
            <s-stack gap="small-200" direction="inline" alignItems="center" justifyContent="space-between">
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-heading>Top Performing Bundles</s-heading>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="top-bundle-tooltip"
                    />
                    <s-tooltip id="top-bundle-tooltip">
                        <s-text>
                            Bundles are ranked by total revenue. Low-traffic
                            bundles are excluded to avoid noise. Trends compare
                            current period with previous period of equal length.
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
