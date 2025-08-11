import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ActionList,
    Badge,
    Box,
    Button,
    EmptyState,
    IndexTable,
    InlineStack,
    Popover,
    Text,
    useIndexResourceState,
} from "@shopify/polaris";
import {
    CalendarIcon,
    ChartVerticalIcon,
    CheckCircleIcon,
    ColorIcon,
    DeleteIcon,
    DuplicateIcon,
    EditIcon,
    OrderIcon,
    PlusCircleIcon,
    PlusIcon,
} from "@shopify/polaris-icons";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import type { BundleStatus, BundleType } from "@/types";

export function BundleTable() {
    const router = useRouter();
    const {
        getFilteredBundles,
        getTotalBundlesCount,
        showToast,
        clearFilters,
    } = useBundlesStore();
    const filteredBundles = getFilteredBundles();
    const totalBundles = getTotalBundlesCount();

    // Selection state
    const resourceIDResolver = (bundle: any) => bundle.id;
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(filteredBundles, {
            resourceIDResolver,
        });

    // Popover state for actions dropdown
    const [actionsPopoverActive, setActionsPopoverActive] = useState(false);
    const toggleActionsPopover = useCallback(() =>
        setActionsPopoverActive((active) => !active), []
    );

    // Get selected bundle for single selection
    const selectedBundle = selectedResources.length === 1
        ? filteredBundles.find(bundle => bundle.id === selectedResources[0])
        : null;

    // Handle actions
    const handleCreateBundle = () => {
        router.push("/bundles/new");
    };

    const handleEditBundle = (bundleId: string) => {
        router.push(`/bundles/${bundleId}/edit`);
    };

    const handleDuplicateBundle = (bundleId: string) => {
        showToast(`Duplicating bundle ${bundleId}...`);
        console.log("Duplicate bundle:", bundleId);
        setActionsPopoverActive(false);
    };

    const handleToggleBundleStatus = (bundleId: string, currentStatus: BundleStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
        showToast(`Bundle status changed to ${newStatus.toLowerCase()}`);
        console.log("Toggle status for bundle:", bundleId, currentStatus);
        setActionsPopoverActive(false);
    };

    const handleDeleteBundle = (bundleId: string) => {
        showToast("Bundle deleted successfully");
        console.log("Delete bundle:", bundleId);
        setActionsPopoverActive(false);
    };

    const handleBulkActivate = () => {
        showToast(`Activated ${selectedResources.length} bundles`);
        console.log("Bulk activate:", selectedResources);
        setActionsPopoverActive(false);
    };

    const handleBulkPause = () => {
        showToast(`Paused ${selectedResources.length} bundles`);
        console.log("Bulk pause:", selectedResources);
        setActionsPopoverActive(false);
    };

    const handleBulkDelete = () => {
        showToast(`Deleted ${selectedResources.length} bundles`);
        console.log("Bulk delete:", selectedResources);
        setActionsPopoverActive(false);
    };

    const handleCancelSelection = () => {
        handleSelectionChange('clear', false);
    };

    // Helper functions
    const getBundleTypeLabel = (type: BundleType) => {
        const typeMap: Record<BundleType, string> = {
            BUY_X_GET_Y: "Buy X Get Y",
            BOGO: "BOGO",
            VOLUME_DISCOUNT: "Volume Discount",
            MIX_MATCH: "Mix & Match",
            CROSS_SELL: "Cross Sell",
            TIERED: "Tiered",
            FLASH_SALE: "Flash Sale",
            GIFT: "Gift",
        };
        return typeMap[type] || type;
    };

    const getStatusBadge = (status: BundleStatus) => {
        switch (status) {
            case "ACTIVE":
                return <Badge tone="success">Active</Badge>;
            case "DRAFT":
                return <Badge tone="subdued">Draft</Badge>;
            case "PAUSED":
                return <Badge tone="warning">Paused</Badge>;
            case "SCHEDULED":
                return <Badge tone="info">Scheduled</Badge>;
            case "ARCHIVED":
                return <Badge tone="critical">Archived</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getBundleIcon = (type: BundleType) => {
        const iconMap: Record<BundleType, any> = {
            BUY_X_GET_Y: PlusCircleIcon,
            BOGO: OrderIcon,
            VOLUME_DISCOUNT: ChartVerticalIcon,
            MIX_MATCH: CheckCircleIcon,
            CROSS_SELL: ColorIcon,
            TIERED: ChartVerticalIcon,
            FLASH_SALE: CalendarIcon,
            GIFT: PlusIcon,
        };
        return iconMap[type] || OrderIcon;
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);

    // Get action items based on selection
    const getActionItems = () => {
        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection actions
            return [
                {
                    content: "Edit bundle",
                    icon: EditIcon,
                    onAction: () => handleEditBundle(selectedBundle.id),
                },
                {
                    content: "Duplicate",
                    icon: DuplicateIcon,
                    onAction: () => handleDuplicateBundle(selectedBundle.id),
                },
                {
                    content: selectedBundle.status === "ACTIVE" ? "Set as draft" : "Set as active",
                    icon: CheckCircleIcon,
                    onAction: () => handleToggleBundleStatus(selectedBundle.id, selectedBundle.status),
                },
                {
                    content: "Delete bundle",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => handleDeleteBundle(selectedBundle.id),
                },
            ];
        } else if (selectedResources.length > 1) {
            // Multiple selection actions
            return [
                {
                    content: "Set as active",
                    icon: CheckCircleIcon,
                    onAction: handleBulkActivate,
                },
                {
                    content: "Set as draft",
                    icon: CheckCircleIcon,
                    onAction: handleBulkPause,
                },
                {
                    content: "Delete bundles",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: handleBulkDelete,
                },
            ];
        }
        return [];
    };

    // Empty states
    if (totalBundles === 0) {
        return (
            <EmptyState
                heading="No bundles created yet"
                action={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: handleCreateBundle,
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>
                    Get started by creating your first bundle to manage product offers.
                </p>
            </EmptyState>
        );
    }

    if (filteredBundles.length === 0) {
        return (
            <EmptyState
                heading="No bundles match your filters"
                action={{
                    content: "Clear filters",
                    onAction: clearFilters,
                }}
            >
                <p>
                    Try adjusting your search terms or filters to see more results.
                </p>
            </EmptyState>
        );
    }

    const rowMarkup = filteredBundles.map((bundle, index) => (
        <IndexTable.Row
            id={bundle.id}
            key={bundle.id}
            selected={selectedResources.includes(bundle.id)}
            position={index}
        >
            <IndexTable.Cell>
                <InlineStack gap="200" align="start">
                    <Box
                        background="bg-success-subdued"
                        padding="100"
                        borderRadius="100"
                    >
                        {React.createElement(getBundleIcon(bundle.type), {
                            tone: "base",
                        })}
                    </Box>
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                        {bundle.name}
                    </Text>
                </InlineStack>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge tone="subdued">
                    {getBundleTypeLabel(bundle.type)}
                </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {getStatusBadge(bundle.status)}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {formatCurrency(bundle.revenue)}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    {bundle.views.toLocaleString()}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    {bundle.productCount}
                </Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    // Create custom bulk actions that will replace the default dropdown
    const customBulkActions = selectedResources.length > 0 ? [
        {
            content: (
                <Popover
                    active={actionsPopoverActive}
                    activator={
                        <Button onClick={toggleActionsPopover} disclosure>
                            Actions
                        </Button>
                    }
                    autofocusTarget="first-node"
                    onClose={toggleActionsPopover}
                >
                    <ActionList
                        actionRole="menuitem"
                        items={getActionItems()}
                    />
                </Popover>
            ),
            onAction: () => {}, // Required but not used
        },
        {
            content: 'Cancel',
            onAction: handleCancelSelection,
        },
    ] : [];

    return (
        <IndexTable
            resourceName={{
                singular: 'bundle',
                plural: 'bundles',
            }}
            itemCount={filteredBundles.length}
            selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            promotedBulkActions={customBulkActions}
            bulkActions={[]} // This removes the default dropdown
            headings={[
                { title: 'Bundle' },
                { title: 'Type' },
                { title: 'Status' },
                { title: 'Revenue' },
                { title: 'Views' },
                { title: 'Products' },
            ]}
            selectable
        >
            {rowMarkup}
        </IndexTable>
    );
}