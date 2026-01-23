import { memo } from "react";
import { BundleTableHeaderProps } from "@/features/bundles";

/*
 * Bundle table header components
 */
export const BundleTableHeader = memo(function BundleTableHeader({
    selectedResources,
    allResourcesSelected,
    toggleAllSelection,
}: BundleTableHeaderProps) {
    const isIndeterminate =
        selectedResources.length > 0 && !allResourcesSelected;

    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-checkbox
                        indeterminate={isIndeterminate}
                        checked={allResourcesSelected}
                        onChange={(e: Event) => {
                            e.stopPropagation();
                            toggleAllSelection();
                        }}
                    />
                    <s-stack paddingBlock="small-400">Bundle Name</s-stack>
                </s-stack>
            </s-table-header>

            <s-table-header>Products</s-table-header>
            <s-table-header>Type</s-table-header>
            <s-table-header>Discount</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>
                <span className="block text-center">Actions</span>
            </s-table-header>
        </s-table-header-row>
    );
});
