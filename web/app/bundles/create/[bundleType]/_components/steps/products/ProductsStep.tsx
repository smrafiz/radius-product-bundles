"use client";

import React from "react";
import {
    BlockStack,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import {
    DeleteIcon,
    PlusIcon,
} from "@shopify/polaris-icons";
import ProductList from "./ProductList";
import { useProductPicker } from "@/hooks/product/useProductPicker";

export default function ProductsStep() {
    const { selectedItems, setSelectedItems } = useBundleStore();
    const { openProductPicker, isLoading } = useProductPicker();

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Products
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                    Select products and variants to include in your bundle
                </Text>
            </BlockStack>

            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={openProductPicker}
                            loading={isLoading}
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

                    <ProductList />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}