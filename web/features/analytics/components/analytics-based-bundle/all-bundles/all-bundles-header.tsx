"use client";

import { LoadingSpinner } from "@/shared";
import { BUNDLE_FILTERS } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";
import {
    getDateRangeLabel,
    useAllBundlesSearch,
    useAnalyticsStore,
} from "@/features/analytics";

/**
 * All Bundles Header Component
 *
 * Contains the title, tooltip, date range indicator, and collapsible search field.
 */
export function AllBundlesHeader({ loading = false }: { loading?: boolean }) {
    const t = useTranslations("Analytics.AllBundles");
    const {
        searchQuery,
        showSearch,
        hasSearchQuery,
        searchContainerRef,
        handleSearchInput,
        toggleSearch,
    } = useAllBundlesSearch();
    const { startDate, endDate } = useAnalyticsStore();

    const dateLabel = getDateRangeLabel(startDate, endDate);

    return (
        <s-stack>
            <s-stack gap="base" padding="base">
                <s-grid
                    gap="small-200"
                    gridTemplateColumns={
                        !showSearch ? "1fr auto auto" : "1fr auto"
                    }
                    alignItems="center"
                >
                    <s-grid-item>
                        {/* Search Field */}
                        <div
                            ref={searchContainerRef}
                            className={`fade-wrapper ${showSearch ? "fade-visible" : "fade-hidden"}`}
                        >
                            <s-search-field
                                name="bundle-search"
                                label={t("searchLabel")}
                                labelAccessibilityVisibility="exclusive"
                                placeholder={BUNDLE_FILTERS.search.placeholder}
                                value={searchQuery}
                                onInput={handleSearchInput}
                            />
                        </div>

                        {/* Title and Info */}
                        <div
                            className={`fade-wrapper ${showSearch ? "fade-hidden" : "fade-visible"}`}
                        >
                            <s-stack
                                direction="inline"
                                gap="small-200"
                                alignItems="center"
                            >
                                <s-heading>{t("heading")}</s-heading>
                                <s-icon
                                    tone="neutral"
                                    type="info"
                                    interestFor="all-bundle-perf-tooltip"
                                />
                                <s-tooltip id="all-bundle-perf-tooltip">
                                    <s-text>{t("tooltip")}</s-text>
                                </s-tooltip>
                            </s-stack>
                        </div>
                    </s-grid-item>

                    {/* Date Range Indicator - Hide when search is open */}
                    {!showSearch && dateLabel && (
                        <s-grid-item>
                            <s-stack
                                direction="inline"
                                gap="small-200"
                                alignItems="center"
                            >
                                {!showSearch && loading && <LoadingSpinner />}

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
                        </s-grid-item>
                    )}

                    {/* Search Toggle Button */}
                    <s-grid-item>
                        <s-stack direction="inline" gap="small-200">
                            <s-button
                                variant={
                                    hasSearchQuery ? "primary" : "secondary"
                                }
                                icon={!showSearch ? "search" : "x"}
                                onClick={toggleSearch}
                                aria-expanded={showSearch}
                                accessibilityLabel={t("searchLabel")}
                                loading={showSearch && loading}
                                interestFor="search-toggle-tooltip"
                            />
                        </s-stack>
                        <s-tooltip id="search-toggle-tooltip">
                            <s-text>
                                {showSearch
                                    ? t("closeSearch")
                                    : hasSearchQuery
                                      ? t("searchActive")
                                      : t("searchLabel")}
                            </s-text>
                        </s-tooltip>
                    </s-grid-item>
                </s-grid>
            </s-stack>
            <s-divider />
        </s-stack>
    );
}
