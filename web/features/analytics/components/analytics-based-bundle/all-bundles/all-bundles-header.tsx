import { useAllBundlesSearch } from "@/features/analytics";

/**
 * All Bundles Header Component
 *
 * Contains the title, tooltip, and search field for the all bundles table.
 */
export function AllBundlesHeader() {
    const { searchQuery, setSearchQuery } = useAllBundlesSearch();

    return (
        <s-box padding="base" border="base" borderStyle="none none solid none">
            <s-stack
                gap="small-200"
                direction="inline"
                justifyContent="space-between"
            >
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-heading>All Bundles Performance</s-heading>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="all-bundle-perf-tooltip"
                    />
                    <s-tooltip id="all-bundle-perf-tooltip">
                        <s-text>
                            Detailed performance metrics for all bundles,
                            including revenue, traffic, conversion, and quality
                            signals. Use this view to diagnose opportunities,
                            identify underperforming bundles, and understand
                            funnel behavior.
                        </s-text>
                    </s-tooltip>
                </s-stack>
                <s-stack direction="inline" gap="base" inlineSize="300px">
                    {/* Search */}
                    <s-search-field
                        placeholder="Search bundles..."
                        value={searchQuery}
                        onInput={(e: any) => setSearchQuery(e.target.value)}
                    />
                </s-stack>
            </s-stack>
        </s-box>
    );
}
