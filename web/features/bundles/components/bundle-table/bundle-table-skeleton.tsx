"use client";

import { SkeletonLine, SkeletonLines, TablePagination } from "@/shared";
import {
    BUNDLE_FILTERS,
    BundleProductsPreview,
    BundleTableHeader,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

const TAB_STATUS_KEYS = ["ALL", "DRAFT", "ACTIVE", "SCHEDULED", "PAUSED", "ARCHIVED"] as const;

/**
 * Bundle table skeleton component
 * Matches the real table structure: status tabs + search/sort + table rows
 */
export function BundleTableSkeleton({ rows = 5 }: { rows?: number }) {
    const t = useTranslations("Bundles.Listing.Filters");
    const ts = useTranslations("Bundles.Statuses");
    const tc = useTranslations("Common");
    return (
        <s-box background="base" borderRadius="large" border="base">
            {/* Status tabs + search + sort */}
            <s-stack gap="base" padding="small">
                <s-grid
                    gap="small-200"
                    gridTemplateColumns="1fr auto auto"
                    alignItems="center"
                >
                    {/* Status tabs skeleton */}
                    <s-grid-item>
                        <s-stack direction="inline" gap="small-400">
                            {TAB_STATUS_KEYS.map((key, index) => (
                                <s-button
                                    key={`${key}-${index}`}
                                    tone="neutral"
                                    variant={
                                        index === 0 ? "secondary" : "tertiary"
                                    }
                                    disabled
                                >
                                    {key === "ALL" ? t("allStatus") : ts(key)}
                                </s-button>
                            ))}
                        </s-stack>
                    </s-grid-item>

                    {/* Search button */}
                    <s-grid-item>
                        <s-button
                            variant="secondary"
                            icon="search"
                            disabled
                            accessibilityLabel={t("searchLabel")}
                        />
                    </s-grid-item>

                    {/* Sort button */}
                    <s-grid-item>
                        <s-button
                            icon="sort"
                            variant="secondary"
                            disabled
                            accessibilityLabel={t("sortLabel")}
                        />
                    </s-grid-item>
                </s-grid>
            </s-stack>

            <s-divider />

            {/* Table skeleton */}
            <s-table>
                <BundleTableHeader
                    selectedResources={[]}
                    allResourcesSelected={false}
                    toggleAllSelection={() => {}}
                />

                <s-table-body>
                    {Array.from({ length: rows }).map((_, i) => (
                        <s-table-row key={i}>
                            {/* Bundle Name */}
                            <s-table-cell>
                                <s-stack
                                    direction="inline"
                                    gap="small"
                                    alignItems="center"
                                >
                                    <s-checkbox disabled />
                                    <s-text>
                                        <span className="block w-20">
                                            <SkeletonLines lines={1} random />
                                        </span>
                                    </s-text>
                                </s-stack>
                            </s-table-cell>
                            {/* Products */}
                            <s-table-cell>
                                <div className="w-9.5 rounded-full overflow-hidden">
                                    <SkeletonLine
                                        height="h-9.5"
                                        width={0}
                                        duration={1.8}
                                    />
                                </div>
                            </s-table-cell>
                            {/* Type */}
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            {/* Discount */}
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            {/* Status */}
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            {/* Actions */}
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>

            {/* Pagination placeholder */}
            <TablePagination
                hasPrevious={false}
                hasNext={false}
                label={tc("loading")}
                onPrevious={() => {}}
                onNext={() => {}}
                loading
            />
        </s-box>
    );
}
