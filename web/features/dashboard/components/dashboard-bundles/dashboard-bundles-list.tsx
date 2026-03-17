"use client";

import { DashboardBundlesTableHeader } from "./dashboard-bundles-table-header";
import { DashboardBundlesListProps } from "@/features/dashboard/types/components.types";
import { formatByType, useAppNavigation } from "@/shared";
import { formatBundleType, getBundleStatusBadge } from "@/features/bundles";

export function DashboardBundlesList({ bundles }: DashboardBundlesListProps) {
    const { bundleData } = useAppNavigation();

    return (
        <div className="relative overflow-hidden">
            <s-table>
                <DashboardBundlesTableHeader />
                <s-table-body>
                    {bundles.map((bundle) => (
                        <s-table-row
                            key={bundle.bundleId}
                            clickDelegate={`dashboard-bundle-item-${bundle.bundleId}`}
                        >
                            <s-table-cell>
                                <s-stack padding="small-300">
                                    <s-clickable
                                        accessibilityLabel={bundle.title}
                                        border="base"
                                        borderRadius="base"
                                        overflow="hidden"
                                        inlineSize="40px"
                                        blockSize="40px"
                                        onClick={() =>
                                            bundleData.edit(bundle.bundleId)
                                        }
                                    >
                                        {bundle.images?.[0] ? (
                                            <s-image
                                                src={bundle.images[0]}
                                                alt={bundle.title}
                                                aspectRatio="1/1"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <s-stack alignItems="center">
                                                <s-icon
                                                    type="image"
                                                    color="subdued"
                                                />
                                            </s-stack>
                                        )}
                                    </s-clickable>
                                </s-stack>
                            </s-table-cell>
                            <s-table-cell>
                                <s-link
                                    id={`dashboard-bundle-item-${bundle.bundleId}`}
                                    onClick={() =>
                                        bundleData.edit(bundle.bundleId)
                                    }
                                >
                                    <s-text>
                                        <span className="block w-55 font-semibold">
                                            {bundle.title}
                                        </span>
                                    </s-text>
                                </s-link>
                            </s-table-cell>
                            <s-table-cell>
                                <span className="block w-30 font-semibold">
                                    {formatBundleType(bundle.type)}
                                </span>
                            </s-table-cell>
                            <s-table-cell>
                                <span className="block w-20">
                                    {formatByType(bundle.views, "number")}
                                </span>
                            </s-table-cell>
                            <s-table-cell>
                                <span className="block w-20">
                                    {formatByType(
                                        bundle.conversionRate,
                                        "percentage",
                                    )}
                                </span>
                            </s-table-cell>
                            <s-table-cell>
                                <span className="block w-20">
                                    {formatByType(bundle.revenue, "currency")}
                                </span>
                            </s-table-cell>
                            <s-table-cell>
                                <span className="block w-20">
                                    {(() => {
                                        const badgeProps = getBundleStatusBadge(
                                            bundle.status,
                                        );
                                        return (
                                            <s-badge
                                                color="base"
                                                icon="enabled"
                                                {...badgeProps}
                                            >
                                                {badgeProps.text}
                                            </s-badge>
                                        );
                                    })()}
                                </span>
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        </div>
    );
}
