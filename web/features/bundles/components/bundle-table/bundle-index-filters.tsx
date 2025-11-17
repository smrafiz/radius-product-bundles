"use client";

import { useCallback, useMemo, useState } from "react";
import { BUNDLE_FILTERS, BUNDLE_SORT_OPTIONS, useBundleFilters, } from "@/features/bundles";

/**
 * Bundle index filters using web components with proper event handling
 */
export function BundleIndexFilters({ loading }: { loading?: boolean }) {
    const {
        filters,
        queryValue,
        setQueryValue,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    } = useBundleFilters();

    const [showFilters, setShowFilters] = useState(false);

    /**
     * Handle search input change
     * Web components use onInput for real-time updates
     */
    const handleSearchInput = useCallback(
        (event: Event) => {
            const target = event.target as HTMLInputElement;
            setQueryValue(target.value);
        },
        [setQueryValue],
    );

    /**
     * Handle tab selection
     */
    const handleTabClick = useCallback(
        (index: number) => setSelectedTab(index),
        [setSelectedTab],
    );

    /**
     * Toggle filters panel
     */
    const toggleFilters = useCallback(
        () => setShowFilters((prev) => !prev),
        [],
    );

    /**
     * Parse current sort selection
     */
    const safeSort = filters.sortSelected || "createdAt desc";
    const sortField = useMemo(() => {
        if (!safeSort) return "createdAt";
        const parts = safeSort.trim().split(" ");
        return parts[0] || "createdAt";
    }, [safeSort]);

    /**
     * Get unique sort fields and directions for the current field
     */
    const sortFields = Array.from(
        new Map(BUNDLE_SORT_OPTIONS.map((opt) => [opt.field, opt])).values(),
    );
    const sortDirections = BUNDLE_SORT_OPTIONS.filter(
        (opt) => opt.field === sortField,
    );

    /**
     * Handle sort field change
     */
    const handleSortFieldChange = useCallback(
        (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            const form = target.closest("form");
            if (!form) return;

            const formData = new FormData(form);
            const newField = formData.get("sort-field") as string;

            if (!newField) return;

            const firstOption = BUNDLE_SORT_OPTIONS.find(
                (opt) => opt.field === newField,
            );
            if (firstOption) {
                setSortSelected(
                    `${firstOption.field} ${firstOption.direction}`,
                );
            }
        },
        [setSortSelected],
    );

    /**
     * Handle sort direction change
     */
    const handleSortDirectionChange = useCallback(
        (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            const form = target.closest("form");
            if (!form) return;

            const formData = new FormData(form);
            const newValue = formData.get("sort-direction") as string;

            if (newValue) {
                setSortSelected(newValue);
            }
        },
        [setSortSelected],
    );

    return (
        <>
            <s-stack gap="base" padding="small">
                {/* Search + Filters + Sort */}
                <s-grid gap="small-200" gridTemplateColumns="1fr auto auto">
                    <s-text-field
                        key={filters.search === "" ? "empty" : "filled"}
                        name="search"
                        label="Search bundles"
                        labelAccessibilityVisibility="exclusive"
                        icon="search"
                        placeholder={BUNDLE_FILTERS.search.placeholder}
                        defaultValue={queryValue}
                        onInput={handleSearchInput}
                        disabled={loading}
                    />

                    {/*<s-button*/}
                    {/*    variant={showFilters ? "primary" : "secondary"}*/}
                    {/*    icon="search"*/}
                    {/*    onClick={toggleFilters}*/}
                    {/*    aria-expanded={showFilters}*/}
                    {/*    disabled={loading}*/}
                    {/*    accessibilityLabel="search bundles"*/}
                    {/*>*/}
                    {/*</s-button>*/}

                    <s-button
                        icon="sort"
                        variant="secondary"
                        accessibilityLabel="Sort bundles"
                        interestFor="sort-tooltip"
                        commandFor="sort-popover"
                        disabled={loading}
                    />
                    <s-tooltip id="sort-tooltip">
                        <s-text>Sort</s-text>
                    </s-tooltip>

                    <s-popover id="sort-popover">
                        <form>
                            <s-box padding="small">
                                <s-choice-list
                                    label="Sort by"
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
                            <s-box padding="small">
                                <s-choice-list
                                    label="Order by"
                                    name="sort-direction"
                                    onChange={handleSortDirectionChange}
                                >
                                    {sortDirections.map((option) => {
                                        const value = `${option.field} ${option.direction}`;
                                        return (
                                            <s-choice
                                                key={value}
                                                value={value}
                                                selected={
                                                    filters.sortSelected ===
                                                    value
                                                }
                                            >
                                                {option.directionLabel}
                                            </s-choice>
                                        );
                                    })}
                                </s-choice-list>
                            </s-box>
                        </form>
                    </s-popover>
                </s-grid>
                {/* Tabs */}
                <s-stack direction="inline" gap="small-400">
                    {BUNDLE_FILTERS.tabs.items.map((item, index) => {
                        const isSelected = filters.selectedTab === index;
                        return (
                            <s-button
                                key={`${item}-${index}`}
                                tone="neutral"
                                variant={isSelected ? "secondary" : "tertiary"}
                                onClick={() => handleTabClick(index)}
                                aria-selected={isSelected}
                                disabled={loading}
                            >
                                {item}
                            </s-button>
                        );
                    })}
                </s-stack>

                {/* Loading */}
                {loading && (
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                    >
                        <s-spinner size="base" />
                        <s-text>Loading bundles...</s-text>
                    </s-stack>
                )}
            </s-stack>
            <s-divider />
        </>
    );
}
