"use client";

import React from "react";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
    TextField,
} from "@shopify/polaris";
import { formatCurrency } from "@/utils";
import { useBundleStore } from "@/lib/stores/bundleStore";
import {
    ProductSelectionModal,
    SelectedItem,
} from "@/app/bundles/create/[bundleType]/_components/productSelection";
import { DeleteIcon, DragHandleIcon, PlusIcon } from "@shopify/polaris-icons";

export default function ProductsStep() {
    const {
        selectedItems,
        addSelectedItems,
        removeSelectedItem,
        updateSelectedItemQuantity,
        setSelectedItems,
    } = useBundleStore();

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleAddProducts = () => {
        setIsModalOpen(true);
    };

    const handleProductsSelected = (items: SelectedItem[]) => {
        // Transform the SelectedItem[] to match your bundle store format
        const transformedItems = items.map((item) => ({
            ...item,
            quantity: 1, // Default quantity for new items
        }));

        addSelectedItems(transformedItems);
        setIsModalOpen(false);
    };

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Get already selected product IDs to prevent duplicates
    const selectedProductIds = selectedItems.map((item) => item.productId);

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Products
                </Text>
                <Text variant="bodySm" tone="subdued">
                    Select products and variants to include in your bundle
                </Text>
            </BlockStack>

            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={handleAddProducts}
                        >
                            Add Products
                        </Button>

                        {selectedItems.length > 0 && (
                            <Button
                                variant="plain"
                                tone="critical"
                                icon={DeleteIcon}
                                onClick={handleClearAll}
                            >
                                Clear all
                            </Button>
                        )}
                    </InlineStack>

                    {selectedItems.length > 0 ? (
                        <BlockStack gap="200">
                            {selectedItems.map((item, index) => (
                                <Card
                                    key={`${item.productId}-${item.variantId || "product"}-${index}`}
                                    background="bg-surface-secondary"
                                >
                                    <Box padding="300">
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                            gap="400"
                                        >
                                            <Icon
                                                source={DragHandleIcon}
                                                tone="subdued"
                                            />

                                            <InlineStack
                                                gap="300"
                                                blockAlign="center"
                                            >
                                                {item.image && (
                                                    <Box
                                                        borderRadius="100"
                                                        minWidth="60px"
                                                        minHeight="60px"
                                                        style={{
                                                            backgroundImage: `url(${item.image})`,
                                                            backgroundSize:
                                                                "cover",
                                                            backgroundPosition:
                                                                "center",
                                                            border: "1px solid #E1E3E5",
                                                        }}
                                                    />
                                                )}

                                                <BlockStack gap="100">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="medium"
                                                    >
                                                        {item.title}
                                                    </Text>
                                                    <InlineStack gap="200">
                                                        <Badge
                                                            tone={
                                                                item.type ===
                                                                "variant"
                                                                    ? "info"
                                                                    : "success"
                                                            }
                                                        >
                                                            {item.type ===
                                                            "variant"
                                                                ? "Variant"
                                                                : "Product"}
                                                        </Badge>
                                                        {item.sku && (
                                                            <Text
                                                                variant="bodySm"
                                                                tone="subdued"
                                                            >
                                                                SKU: {item.sku}
                                                            </Text>
                                                        )}
                                                        <Text
                                                            variant="bodySm"
                                                            tone="subdued"
                                                        >
                                                            {formatCurrency(
                                                                item.price,
                                                            )}
                                                        </Text>
                                                    </InlineStack>
                                                </BlockStack>
                                            </InlineStack>

                                            <InlineStack
                                                gap="300"
                                                blockAlign="center"
                                            >
                                                <TextField
                                                    value={
                                                        item.quantity?.toString() ||
                                                        "1"
                                                    }
                                                    onChange={(value) =>
                                                        updateSelectedItemQuantity(
                                                            index,
                                                            parseInt(value) ||
                                                                1,
                                                        )
                                                    }
                                                    type="number"
                                                    min="1"
                                                    autoComplete="off"
                                                    style={{ width: "80px" }}
                                                />

                                                <Button
                                                    variant="plain"
                                                    icon={DeleteIcon}
                                                    onClick={() =>
                                                        removeSelectedItem(
                                                            index,
                                                        )
                                                    }
                                                />
                                            </InlineStack>
                                        </InlineStack>
                                    </Box>
                                </Card>
                            ))}

                            {/* Summary */}
                            <Card>
                                <Box
                                    padding="300"
                                    background="bg-surface-hover"
                                >
                                    <InlineStack
                                        align="space-between"
                                        blockAlign="center"
                                    >
                                        <Text
                                            variant="bodyMd"
                                            fontWeight="medium"
                                        >
                                            Total Items: {selectedItems.length}
                                        </Text>
                                        <Text
                                            variant="bodyMd"
                                            fontWeight="medium"
                                        >
                                            Total Quantity:{" "}
                                            {selectedItems.reduce(
                                                (sum, item) =>
                                                    sum + (item.quantity || 1),
                                                0,
                                            )}
                                        </Text>
                                        <Text
                                            variant="bodyMd"
                                            fontWeight="medium"
                                        >
                                            Bundle Value:{" "}
                                            {formatCurrency(
                                                selectedItems
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            parseFloat(
                                                                item.price,
                                                            ) *
                                                                (item.quantity ||
                                                                    1),
                                                        0,
                                                    )
                                                    .toString(),
                                            )}
                                        </Text>
                                    </InlineStack>
                                </Box>
                            </Card>
                        </BlockStack>
                    ) : (
                        <Box
                            padding="800"
                            background="bg-surface-secondary"
                            borderRadius="200"
                        >
                            <InlineStack align="center">
                                <BlockStack gap="200" inlineAlign="center">
                                    <Text variant="bodyMd" tone="subdued">
                                        No products selected
                                    </Text>
                                    <Text variant="bodySm" tone="subdued">
                                        Add products and variants to create your
                                        bundle
                                    </Text>
                                </BlockStack>
                            </InlineStack>
                        </Box>
                    )}
                </BlockStack>
            </Card>

            <ProductSelectionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onProductsSelected={handleProductsSelected}
                selectedProductIds={selectedProductIds}
                title="Add Products to Bundle"
            />
        </BlockStack>
    );
}
