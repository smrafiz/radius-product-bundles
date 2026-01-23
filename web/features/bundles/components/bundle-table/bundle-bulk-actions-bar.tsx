import { memo, useCallback } from "react";
import {
    BundleBulkActionsBarProps,
    BundleBulkActionsButtons,
    BundleBulkActionsPopover,
    useBundleActions,
    useBundleListingStore,
    useBundleTableBulkActions,
} from "@/features/bundles";

/*
 * Bundle bulk actions bar components
 */
export const BundleBulkActionsBar = memo(function BundleBulkActionsBar({
    selectedResources,
    selectedBundle,
    allResourcesSelected,
    toggleAllSelection,
    clearSelection,
}: BundleBulkActionsBarProps) {
    const { showToast } = useBundleListingStore();

    const { actions: selectedBundleActions } = useBundleActions(
        selectedBundle,
        clearSelection,
    );

    const { getPromotedBulkActions, getBulkActions } =
        useBundleTableBulkActions(clearSelection);

    const handleClear = useCallback(() => {
        clearSelection();
        showToast("Selection cleared");
    }, [clearSelection, showToast]);

    const promotedActions = [
        ...getPromotedBulkActions(
            selectedResources,
            selectedBundle,
            selectedBundleActions,
        ),
        { content: "Cancel", onAction: handleClear },
    ];

    const bulkActions = getBulkActions(
        selectedResources,
        selectedBundle,
        selectedBundleActions,
    );

    const isIndeterminate =
        selectedResources.length > 0 && !allResourcesSelected;

    return (
        <div className="absolute z-10 top-0 w-full">
            <s-box
                paddingInline="small"
                paddingBlock="small-400"
                background="subdued"
            >
                <s-stack direction="inline" justifyContent="space-between">
                    <s-stack direction="inline" gap="small" alignItems="center">
                        <s-checkbox
                            indeterminate={isIndeterminate}
                            checked={allResourcesSelected}
                            onChange={(e: Event) => {
                                e.stopPropagation();
                                toggleAllSelection();
                            }}
                        />
                        <s-text>
                            <span className="font-medium">
                                {selectedResources.length} selected
                            </span>
                        </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="small-300">
                        <BundleBulkActionsButtons actions={promotedActions} />

                        {bulkActions.length > 0 && (
                            <BundleBulkActionsPopover actions={bulkActions} />
                        )}
                    </s-stack>
                </s-stack>
            </s-box>
        </div>
    );
});
