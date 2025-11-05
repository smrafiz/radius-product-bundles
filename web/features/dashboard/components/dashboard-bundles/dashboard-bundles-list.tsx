"use client";

import {
    formatCurrency,
    formatPercentage,
    useAppNavigation,
} from "@/shared";
import {
    DashboardBundlesListProps,
} from "@/features/dashboard";
import {
    formatBundleType,
    getBundleStatusBadge,
} from "@/features/bundles";

/*
 * Dashboard bundles list
 */
export function DashboardBundlesList({ bundles }: DashboardBundlesListProps) {
    const { bundleData } = useAppNavigation();
    console.log(bundles);

    return (
        <s-table>
            <s-table-header-row>
                <s-table-header></s-table-header>
                <s-table-header>Name</s-table-header>
                <s-table-header>Type</s-table-header>
                <s-table-header format="numeric">Views</s-table-header>
                <s-table-header format="numeric">Conversion</s-table-header>
                <s-table-header format="numeric">Revenue</s-table-header>
                <s-table-header listSlot="primary">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
                {bundles.map((bundle, index) => (
                    <s-table-row key={bundle.id} clickDelegate="mountain-view-checkbox">
                        <s-table-cell>
                            <s-stack direction="inline" gap="small" alignItems="center">
                                <s-clickable
                                    accessibilityLabel={bundle.name}
                                    border="base"
                                    borderRadius="base"
                                    overflow="hidden"
                                    inlineSize="40px"
                                    blockSize="40px"
                                    onClick={() => bundleData.edit(bundle.id)}
                                >
                                    <s-image
                                        objectFit="cover"
                                        src=""
                                    ></s-image>
                                </s-clickable>

                            </s-stack>
                        </s-table-cell>
                        <s-table-cell><s-link onClick={() => bundleData.edit(bundle.id)}>{bundle.name}</s-link></s-table-cell>
                        <s-table-cell>{formatBundleType(bundle.type)}</s-table-cell>
                        <s-table-cell>{bundle.views}</s-table-cell>
                        <s-table-cell>{formatPercentage(bundle.conversionRate)}</s-table-cell>
                        <s-table-cell>{formatCurrency(bundle.revenue)}</s-table-cell>
                        <s-table-cell>
                            {(() => {
                                const badgeProps = getBundleStatusBadge(bundle.status);
                                return (
                                    <s-badge color="base" icon="enabled" {...badgeProps}>
                                        {badgeProps.text}
                                    </s-badge>
                                );
                            })()}
                        </s-table-cell>
                    </s-table-row>
                ))}
            </s-table-body>
        </s-table>

        // <ResourceList
        //     resourceName={{ singular: "bundle", plural: "bundles" }}
        //     items={bundles}
        //     renderItem={(bundle) => (
        //         <ResourceItem
        //             key={bundle.id}
        //             id={bundle.id}
        //             accessibilityLabel={`View details for ${bundle.name}`}
        //             onClick={() => bundleData.edit(bundle.id)}
        //             media={
        //                 <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
        //                     <Text
        //                         as="span"
        //                         variant="headingSm"
        //                         tone="text-inverse"
        //                     >
        //                         {firstLetterCapital(bundle.name)}
        //                     </Text>
        //                 </div>
        //             }
        //         >
        //             <BlockStack gap="100">
        //                 <InlineStack align="space-between">
        //                     <Text
        //                         as="h3"
        //                         variant="bodyMd"
        //                         fontWeight="semibold"
        //                     >
        //                         {bundle.name}
        //                     </Text>
        //                     <Badge {...getBundleStatusBadge(bundle.status)} />
        //                 </InlineStack>
        //                 <Text as="span" variant="bodySm" tone="subdued">
        //                     {formatBundleType(bundle.type)} •{" "}
        //                     {bundle.productCount} products
        //                 </Text>
        //                 <InlineStack gap="400">
        //                     <Text as="span" variant="bodySm">
        //                         <strong>
        //                             {formatPercentage(bundle.conversionRate)}
        //                         </strong>{" "}
        //                         conversion
        //                     </Text>
        //                     <Text as="span" variant="bodySm">
        //                         <strong>
        //                             {formatCurrency(bundle.revenue)}
        //                         </strong>{" "}
        //                         revenue
        //                     </Text>
        //                 </InlineStack>
        //                 <ProgressBar
        //                     progress={Math.min(bundle.conversionRate * 10, 100)}
        //                     size="small"
        //                 />
        //             </BlockStack>
        //         </ResourceItem>
        //     )}
        // />
    );
}