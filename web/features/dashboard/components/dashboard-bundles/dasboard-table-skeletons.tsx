import { ComponentType } from "react";
import { SkeletonLine, SkeletonLines } from "@/shared";

/**
 * Top Bundles Skeleton
 */
export function DashboardTopBundlesSkeleton({
    Header,
    TableHeader,
    rows = 3,
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
                                <div className="w-9.5">
                                    <SkeletonLine
                                        height="h-9.5"
                                        width={0}
                                        duration={1.8}
                                    />
                                </div>
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
