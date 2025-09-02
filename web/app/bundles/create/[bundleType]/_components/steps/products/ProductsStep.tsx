import React from "react";
import {
    Banner,
    BlockStack,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { StepHeading } from "@/bundles/create/[bundleType]/_components/shared";
import { ProductList } from "@/bundles/create/[bundleType]/_components/steps/products";

import { useBundleStore } from "@/stores";
import { useBundleValidation, useProductPicker } from "@/hooks";

export default function ProductsStep() {
    const { selectedItems, setSelectedItems, validationAttempted } =
        useBundleStore();
    const { getAllErrors } = useBundleValidation();
    const { openProductPicker, isLoading } = useProductPicker();

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    // Get validation errors for this step
    const errors = getAllErrors();
    const hasProductError =
        validationAttempted &&
        errors.some((error) => error.path.includes("products"));
    const productErrorMessage = errors.find((error) =>
        error.path.includes("products"),
    )?.message;

    return (
        <BlockStack gap="500">
            <StepHeading
                title="Products"
                description="Select products and variants to include in your bundle"
            />

            {/* Validation Error Banner */}
            {hasProductError && (
                <Banner tone="critical">{productErrorMessage}</Banner>
            )}

            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={openProductPicker}
                            loading={isLoading}
                            tone={hasProductError ? "critical" : undefined}
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
