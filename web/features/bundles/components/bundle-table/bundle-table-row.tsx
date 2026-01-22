// "use client";
//
// import {
//     BundleActionsGroup,
//     bundleCurrencyFormatter,
//     BundleProductsPreview,
//     BundleTableRowProps,
//     formatBundleDiscount,
//     getBundleProperty,
//     StatusPopover,
//     useBundleActions,
// } from "@/features/bundles";
// import { useShopSettings } from "@/shared";
// import { Box, IndexTable, Link, Text } from "@shopify/polaris";
//
// /**
//  * Bundle table row
//  */
// export function BundleTableRow({
//     bundle,
//     index,
//     isSelected,
// }: BundleTableRowProps) {
//     const { isLoading, currencyCode } = useShopSettings();
//     const { actions } = useBundleActions(bundle);
//
//     const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
//     const formatDiscount = () =>
//         formatBundleDiscount(bundle, currencyFormatter);
//
//     return (
//         <IndexTable.Row
//             id={bundle.id}
//             key={bundle.id}
//             selected={isSelected}
//             position={index}
//         >
//             {/* Bundle name */}
//             <IndexTable.Cell className="w-55 whitespace-normal!" flush>
//                 <div onClick={(e) => e.stopPropagation()}>
//                     <Link
//                         removeUnderline
//                         monochrome
//                         onClick={() => actions.edit()}
//                     >
//                         <Text variant="bodyMd" fontWeight="medium" as="h2">
//                             {bundle.name}
//                         </Text>
//                     </Link>
//                 </div>
//             </IndexTable.Cell>
//
//             {/* Bundled products */}
//             <IndexTable.Cell className="w-37.5 whitespace-normal!">
//                 <div onClick={(e) => e.stopPropagation()}>
//                     <Text variant="bodyMd" as="span">
//                         <BundleProductsPreview bundle={bundle} />
//                     </Text>
//                 </div>
//             </IndexTable.Cell>
//
//             {/* Bundle type */}
//             <IndexTable.Cell className="w-37.5 whitespace-normal!">
//                 <div
//                     className="cursor-default"
//                     onClick={(e) => e.stopPropagation()}
//                 >
//                     <Text variant="bodyMd" fontWeight="medium" as="span">
//                         {getBundleProperty(bundle.type, "label")}
//                     </Text>
//                 </div>
//             </IndexTable.Cell>
//
//             {/* Bundle price */}
//             <IndexTable.Cell className="w-30 whitespace-normal!">
//                 <div
//                     className="cursor-default"
//                     onClick={(e) => e.stopPropagation()}
//                 >
//                     <Text
//                         variant="bodyMd"
//                         fontWeight="medium"
//                         as="span"
//                         tone="subdued"
//                     >
//                         {isLoading ? "•" : formatDiscount()}
//                     </Text>
//                 </div>
//             </IndexTable.Cell>
//
//             {/* Bundle status */}
//             <IndexTable.Cell>
//                 <div onClick={(e) => e.stopPropagation()}>
//                     <StatusPopover bundle={bundle} />
//                 </div>
//             </IndexTable.Cell>
//
//             {/* Bundle actions */}
//             <IndexTable.Cell>
//                 <Box padding="0">
//                     <div
//                         className="flex justify-center"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <BundleActionsGroup
//                             bundle={bundle}
//                             onAction={actions}
//                         />
//                     </div>
//                 </Box>
//             </IndexTable.Cell>
//         </IndexTable.Row>
//     );
// }

"use client";

import {
    BundleActionsGroup,
    bundleCurrencyFormatter,
    BundleProductsPreview,
    formatBundleDiscount,
    getBundleProperty,
    StatusPopover,
    useBundleActions,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";

interface BundleTableRowProps {
    bundle: any;
    index: number;
    isSelected: boolean;
    onToggleSelection: (bundleId: string) => void;
}

/**
 * Bundle table row with web components
 */
export function BundleTableRow({
    bundle,
    index,
    isSelected,
    onToggleSelection,
}: BundleTableRowProps) {
    const { isLoading, currencyCode } = useShopSettings();
    const { actions } = useBundleActions(bundle);

    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
    const formatDiscount = () =>
        formatBundleDiscount(bundle, currencyFormatter);

    return (
        <s-table-row id={bundle.id}>
            {/* Checkbox */}
            <s-table-cell>
                <s-checkbox
                    checked={isSelected}
                    onChange={(e: Event) => {
                        e.stopPropagation();
                        onToggleSelection(bundle.id);
                    }}
                />
            </s-table-cell>

            {/* Bundle name */}
            <s-table-cell>
                <s-link
                    // removeUnderline
                    onClick={(e: Event) => {
                        e.stopPropagation();
                        actions.edit();
                    }}
                >
                    <s-text>{bundle.name}</s-text>
                </s-link>
            </s-table-cell>

            {/* Bundled products */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>
                        <BundleProductsPreview bundle={bundle} />
                    </s-text>
                </div>
            </s-table-cell>

            {/* Bundle type */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>{getBundleProperty(bundle.type, "label")}</s-text>
                </div>
            </s-table-cell>

            {/* Bundle discount */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>{isLoading ? "•" : formatDiscount()}</s-text>
                </div>
            </s-table-cell>

            {/* Bundle status */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <StatusPopover bundle={bundle} />
                </div>
            </s-table-cell>

            {/* Bundle actions */}
            <s-table-cell>
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", justifyContent: "center" }}
                >
                    <BundleActionsGroup bundle={bundle} onAction={actions} />
                </div>
            </s-table-cell>
        </s-table-row>
    );
}
