"use client";

import { DashboardBundlesListProps } from "@/features/dashboard";
import { formatBundleType, getBundleStatusBadge } from "@/features/bundles";
import { formatCurrency, formatPercentage, useAppNavigation } from "@/shared";

export function DashboardBundlesList({ bundles }: DashboardBundlesListProps) {
    const { bundleData } = useAppNavigation();

    return (
        <s-table>
            <s-table-header-row>
                <s-table-header listSlot="primary">Item</s-table-header>
                <s-table-header listSlot="labeled">Name</s-table-header>
                <s-table-header listSlot="inline">Type</s-table-header>
                <s-table-header format="numeric">Views</s-table-header>
                <s-table-header format="numeric">Conversion</s-table-header>
                <s-table-header format="numeric">Revenue</s-table-header>
                <s-table-header listSlot="primary">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
                {bundles.map((bundle) => (
                    <s-table-row
                        key={bundle.id}
                        clickDelegate="mountain-view-checkbox"
                    >
                        <s-table-cell>
                            <s-clickable
                                accessibilityLabel={bundle.name}
                                border="base"
                                borderRadius="base"
                                overflow="hidden"
                                inlineSize="40px"
                                blockSize="40px"
                                onClick={() => bundleData.edit(bundle.id)}
                            >
                                <s-stack alignItems="center">
                                    <s-icon type="image" color="subdued"/>
                                </s-stack>
                            </s-clickable>
                        </s-table-cell>
                        <s-table-cell>
                            <s-link onClick={() => bundleData.edit(bundle.id)}>
                                <span className="max-w-[220px]">{bundle.name}</span>
                            </s-link>
                        </s-table-cell>
                        <s-table-cell>
                            {formatBundleType(bundle.type)}
                        </s-table-cell>
                        <s-table-cell>{bundle.views}</s-table-cell>
                        <s-table-cell>
                            {formatPercentage(bundle.conversionRate)}
                        </s-table-cell>
                        <s-table-cell>
                            {formatCurrency(bundle.revenue)}
                        </s-table-cell>
                        <s-table-cell>
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
                        </s-table-cell>
                    </s-table-row>
                ))}
            </s-table-body>
        </s-table>
    );
}
