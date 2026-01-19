"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/shared";
import { useAllBundlesTableStore } from "@/features/analytics";
import { BUNDLE_FILTERS } from "@/features/bundles";

/**
 * All Bundles Header Component
 *
 * Contains the title, tooltip, and collapsible search field for the all bundles table.
 * Follows the same pattern as BundleIndexFilters.
 */
export function AllBundlesHeader({ loading = false }: { loading?: boolean }) {
    const { searchQuery, setSearchQuery } = useAllBundlesTableStore();
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Check if there's an active search query
    const hasSearchQuery = searchQuery.trim() !== "";

    /**
     * Toggle search field visibility
     */
    const toggleFilters = () => {
        if (showSearch) {
            // Closing search - clear the query
            setSearchQuery("");
        }
        setShowSearch(!showSearch);
    };

    /**
     * Handle search input change
     */
    const handleSearchInput = useCallback(
        (event: Event) => {
            const target = event.target as HTMLInputElement;
            setSearchQuery(target.value);
        },
        [setSearchQuery],
    );

    /**
     * Autofocus search field when shown
     */
    useEffect(() => {
        if (showSearch && searchContainerRef.current) {
            const timer = setTimeout(() => {
                const searchField =
                    searchContainerRef.current?.querySelector("s-search-field");
                if (searchField) {
                    const input =
                        searchField.shadowRoot?.querySelector("input") ||
                        searchField.querySelector("input");
                    if (input) {
                        input.focus();
                    }
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showSearch]);

    return (
        <>
            <s-stack gap="base" padding="small">
                <s-grid
                    gap="small-200"
                    gridTemplateColumns={!showSearch ? "1fr auto" : "1fr auto"}
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
                                label="Search bundles"
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
                                <s-heading>All Bundles Performance</s-heading>
                                <s-icon
                                    tone="neutral"
                                    type="info"
                                    interestFor="all-bundle-perf-tooltip"
                                />
                                <s-tooltip id="all-bundle-perf-tooltip">
                                    <s-text>
                                        Detailed performance metrics for all
                                        bundles, including revenue, traffic,
                                        conversion, and quality signals. Use
                                        this view to diagnose opportunities,
                                        identify underperforming bundles, and
                                        understand funnel behavior.
                                    </s-text>
                                </s-tooltip>
                            </s-stack>
                        </div>
                    </s-grid-item>

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
                                accessibilityLabel="search bundles"
                                loading={showSearch && loading}
                                interestFor="search-toggle-tooltip"
                            />
                        </s-stack>
                        <s-tooltip id="search-toggle-tooltip">
                            <s-text>
                                {showSearch
                                    ? "Close search"
                                    : hasSearchQuery
                                      ? "Search active"
                                      : "Search bundles"}
                            </s-text>
                        </s-tooltip>
                    </s-grid-item>
                </s-grid>
            </s-stack>
            <s-divider />
        </>
    );
}
