"use client";

import { DashboardBundlesListProps } from "@/features/dashboard";
import { formatBundleType, getBundleStatusBadge } from "@/features/bundles";
import { formatCurrency, formatPercentage, useAppNavigation } from "@/shared";

export function DashboardBundlesList({ bundles }: DashboardBundlesListProps) {
    const { bundleData } = useAppNavigation();

    return (
        <div className="relative overflow-hidden">
        <s-table>
            <s-table-header-row>
                <s-table-header listSlot="primary"><s-stack padding="small-300">Item</s-stack></s-table-header>
                <s-table-header listSlot="labeled">Name</s-table-header>
                <s-table-header listSlot="inline">Type</s-table-header>
                <s-table-header>Views</s-table-header>
                <s-table-header>Conversion</s-table-header>
                <s-table-header>Revenue</s-table-header>
                <s-table-header listSlot="primary">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
                {bundles.map((bundle) => (
                    <s-table-row
                        key={bundle.bundleId}
                        clickDelegate="mountain-view-checkbox"
                    >
                        <s-table-cell>
                            <s-clickable
                                accessibilityLabel={bundle.title}
                                border="base"
                                borderRadius="base"
                                overflow="hidden"
                                inlineSize="40px"
                                blockSize="40px"
                                onClick={() => bundleData.edit(bundle.bundleId)}
                            >
                                {bundle.images?.[0] ? (
                                    <s-image src={bundle.images[0]} alt={bundle.title} aspectRatio="1/1" objectFit="cover" />
                                ) : (
                                    <s-stack alignItems="center">
                                        <s-icon type="image" color="subdued"/>
                                    </s-stack>
                                )}
                            </s-clickable>
                        </s-table-cell>
                        <s-table-cell>
                            <s-link onClick={() => bundleData.edit(bundle.bundleId)}>
                                <s-text>
                                    <span className="block w-55 font-semibold">{bundle.title}</span>
                                </s-text>
                            </s-link>
                        </s-table-cell>
                        <s-table-cell>
                            <span className="block w-30 font-semibold">{formatBundleType(bundle.type)}</span>
                        </s-table-cell>
                        <s-table-cell><span className="block w-20">{bundle.views}</span></s-table-cell>
                        <s-table-cell>
                            <span className="block w-20">{formatPercentage(bundle.conversionRate)}</span>
                        </s-table-cell>
                        <s-table-cell>
                            <span className="block w-20">{formatCurrency(bundle.revenue)}</span>
                        </s-table-cell>
                        <s-table-cell><span className="block w-20">
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
                            })()}</span>
                        </s-table-cell>
                    </s-table-row>
                ))}
            </s-table-body>
        </s-table>
        </div>
    );
}
