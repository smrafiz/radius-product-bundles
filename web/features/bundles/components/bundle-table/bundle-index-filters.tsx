"use client";

import { LoadingSpinner } from "@/shared";
import { BUNDLE_FILTERS, useBundleFilters } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle index filters component
 */
export function BundleIndexFilters({
    loading,
    hasSelection,
}: {
    loading?: boolean;
    hasSelection: boolean;
}) {
    const {
        filters,
        queryValue,
        showSearch,
        searchContainerRef,
        sortField,
        sortFields,
        sortDirections,
        hasSearchQuery,
        hasStatusFilter,
        handleSearchInput,
        handleStatusFilterChange,
        handleTabClick,
        toggleFilters,
        handleSortFieldChange,
        handleSortDirectionClick,
    } = useBundleFilters();
    const t = useTranslations("Bundles.Listing.Filters");

    return (
        <>
            <s-stack gap="base" padding="small">
                <s-grid
                    gap="small-200"
                    gridTemplateColumns={
                        !showSearch ? "1fr auto auto" : "1fr auto auto auto"
                    }
                    alignItems="center"
                >
                    <s-grid-item>
                        {/* Search Field */}
                        <div
                            ref={searchContainerRef}
                            className={`fade-wrapper ${
                                showSearch
                                    ? "fade-visible z-20 relative"
                                    : "fade-hidden"
                            }`}
                        >
                            <s-search-field
                                name="search"
                                label={t("searchLabel")}
                                labelAccessibilityVisibility="exclusive"
                                placeholder={t("searchPlaceholder")}
                                value={queryValue}
                                onInput={handleSearchInput}
                            />
                        </div>

                        {/* Status Tabs */}
                        <div
                            className={`fade-wrapper ${
                                showSearch ? "fade-hidden" : "fade-visible"
                            }`}
                        >
                            <s-stack direction="inline" gap="small-400">
                                {BUNDLE_FILTERS.tabs.items.map(
                                    (item, index) => (
                                        <s-button
                                            key={`${item}-${index}`}
                                            tone="neutral"
                                            variant={
                                                filters.selectedTab === index
                                                    ? "secondary"
                                                    : "tertiary"
                                            }
                                            onClick={() =>
                                                handleTabClick(index)
                                            }
                                            aria-selected={
                                                filters.selectedTab === index
                                            }
                                        >
                                            {item}
                                        </s-button>
                                    ),
                                )}
                            </s-stack>
                        </div>
                    </s-grid-item>

                    {/* Status Filter Button */}
                    {showSearch && (
                        <s-grid-item>
                            <s-button
                                icon="filter"
                                variant={
                                    hasStatusFilter ? "primary" : "secondary"
                                }
                                accessibilityLabel={t("filterByStatus")}
                                interestFor="status-filter-tooltip"
                                commandFor="status-filter-popover"
                            />
                            <s-tooltip id="status-filter-tooltip">
                                <s-text>
                                    {hasStatusFilter
                                        ? `${t("filterByStatus")}: ${filters.selectedTab !== undefined ? BUNDLE_FILTERS.tabs.items[filters.selectedTab] : t("allStatus")}`
                                        : t("filterByStatusLabel")}
                                </s-text>
                            </s-tooltip>
                        </s-grid-item>
                    )}

                    {/* Search Toggle Button */}
                    <s-grid-item>
                        <s-stack direction="inline" gap="small-200">
                            {!showSearch && loading && <LoadingSpinner />}
                            <s-button
                                variant={
                                    hasSearchQuery ? "primary" : "secondary"
                                }
                                icon={!showSearch ? "search" : "x"}
                                onClick={toggleFilters}
                                aria-expanded={showSearch}
                                accessibilityLabel={t("searchLabel")}
                                loading={showSearch && loading}
                                interestFor="search-close-tooltip"
                            />
                        </s-stack>
                        <s-tooltip id="search-close-tooltip">
                            <s-text>
                                {showSearch
                                    ? t("closeSearch")
                                    : hasSearchQuery
                                      ? t("searchActive")
                                      : t("searchLabel")}
                            </s-text>
                        </s-tooltip>
                    </s-grid-item>

                    {/* Sort Button */}
                    <s-grid-item>
                        <s-button
                            icon="sort"
                            variant="secondary"
                            accessibilityLabel={t("sortLabel")}
                            interestFor="sort-tooltip"
                            commandFor="sort-popover"
                        />
                        <s-tooltip id="sort-tooltip">
                            <s-text>{t("sortTooltip")}</s-text>
                        </s-tooltip>
                    </s-grid-item>

                    {/* Status Filter Popover */}
                    <s-popover id="status-filter-popover">
                        <form>
                            <s-box padding="small">
                                <s-choice-list
                                    label={t("filterByStatusLabel")}
                                    name="status-filter"
                                    onChange={handleStatusFilterChange}
                                >
                                    {BUNDLE_FILTERS.tabs.items.map(
                                        (item, index) => (
                                            <s-choice
                                                key={`status-${index}`}
                                                value={item.toLowerCase()}
                                                selected={
                                                    filters.selectedTab ===
                                                    index
                                                }
                                            >
                                                {item}
                                            </s-choice>
                                        ),
                                    )}
                                </s-choice-list>
                            </s-box>
                        </form>
                    </s-popover>

                    {/* Sort Popover */}
                    <s-popover id="sort-popover" minInlineSize="135px">
                        <form>
                            {/* Sort Field Selection */}
                            <s-box padding="small">
                                <s-choice-list
                                    label={t("sortByLabel")}
                                    name="sort-field"
                                    onChange={handleSortFieldChange}
                                >
                                    {sortFields.map((option) => (
                                        <s-choice
                                            key={option.field}
                                            value={option.field}
                                            selected={
                                                sortField === option.field
                                            }
                                        >
                                            {option.label}
                                        </s-choice>
                                    ))}
                                </s-choice-list>
                            </s-box>

                            <s-divider />

                            {/* Sort Direction Buttons */}
                            <s-box padding="small">
                                <s-stack gap="small-400">
                                    {sortDirections.map((option) => {
                                        const value = `${option.field} ${option.direction}`;
                                        const isSelected =
                                            filters.sortSelected === value;
                                        const iconName =
                                            option.direction === "asc"
                                                ? "arrow-up"
                                                : "arrow-down";

                                        return (
                                            <s-button
                                                key={value}
                                                variant={
                                                    isSelected
                                                        ? "secondary"
                                                        : "tertiary"
                                                }
                                                onClick={() =>
                                                    handleSortDirectionClick(
                                                        value,
                                                    )
                                                }
                                                icon={iconName}
                                                type="button"
                                            >
                                                {option.directionLabel}
                                            </s-button>
                                        );
                                    })}
                                </s-stack>
                            </s-box>
                        </form>
                    </s-popover>
                </s-grid>
            </s-stack>
            <s-divider />
        </>
    );
}
