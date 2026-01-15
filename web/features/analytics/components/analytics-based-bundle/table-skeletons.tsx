import { ComponentType } from "react";
import { SkeletonLines } from "@/shared";

/**
 * Top Bundles Skeleton
 */
export function TopBundlesSkeleton({
    Header,
    TableHeader,
    rows = 5,
}: {
    Header: ComponentType;
    TableHeader: ComponentType;
    rows?: number;
}) {
    return (
        <s-section padding="none">
            {/* Section title */}
            <Header />

            <s-table>
                {/* Table header */}
                <TableHeader />

                <s-table-body>
                    {Array.from({ length: rows }).map((_, i) => (
                        <s-table-row key={i}>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                            <s-table-cell>
                                <SkeletonLines lines={1} random />
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        </s-section>
    );
}
