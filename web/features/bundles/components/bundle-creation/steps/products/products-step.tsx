"use client";

import {
    BlockStack,
    Button,
    Card,
    InlineError,
    InlineStack,
} from "@shopify/polaris";
import {
    ProductList,
    StepHeading,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useEffect } from "react";
import { useProductPicker } from "@/shared";
import { useFormContext } from "react-hook-form";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";

export function ProductsStep() {
    const { selectedItems, setSelectedItems, validationAttempted } =
        useBundleStore();
    const { getAllErrors } = useBundleValidation();
    const { openProductPicker, isLoading } = useProductPicker();
    const { clearErrors } = useFormContext();

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    useEffect(() => {
        if (selectedItems.length > 0) {
            clearErrors("products");
        }
    }, [selectedItems.length, clearErrors]);

    // Get validation errors for this step
    const errors = getAllErrors();
    const hasProductError =
        validationAttempted &&
        errors.some(
            (error) => error.field === "products" || error.path === "products",
        );
    const productErrorMessage = errors.find(
        (error) => error.field === "products" || error.path === "products",
    )?.message;

    return (
        <BlockStack gap="500">
            <StepHeading
                title="Products"
                description="Select products and variants to include in your bundle"
            />

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
                    {productErrorMessage && (
                        <InlineError
                            message={productErrorMessage}
                            fieldID="products"
                        />
                    )}

                    <ProductList />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}
