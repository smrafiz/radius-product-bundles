"use client";
import {
    BundleDetails,
    ProductBundle,
    ProductList,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useEffect } from "react";
import { useProductPicker } from "@/shared";
import { useFormContext } from "react-hook-form";

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
        if (selectedItems.length >= 2) {
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
    const showProductHint = selectedItems.length === 1 && !hasProductError;

    return (
        <s-stack gap="base">
            {/* Bundle details */}
            <s-section>
                <BundleDetails />
            </s-section>

            {/* Bundle product list */}
            <s-section>
                <s-heading>Select products</s-heading>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-button
                            variant="primary"
                            icon="plus"
                            onClick={openProductPicker}
                            loading={isLoading}
                            tone={hasProductError ? "critical" : undefined}
                        >
                            Add products
                        </s-button>
                        {selectedItems.length > 0 && (
                            <s-button
                                variant="secondary"
                                tone="critical"
                                icon="delete"
                                onClick={handleClearAll}
                            >
                                Clear all
                            </s-button>
                        )}
                    </s-stack>
                    {productErrorMessage && (
                        <s-banner tone="critical" data-fieldid="products">
                            {productErrorMessage}
                        </s-banner>
                    )}
                    {showProductHint && (
                        <s-banner tone="info">
                            Add at least one more product to create a bundle. ({selectedItems.length}/2 minimum)
                        </s-banner>
                    )}
                    <ProductList />
                </s-stack>
            </s-section>

            <s-section>
                <ProductBundle />
            </s-section>
        </s-stack>
    );
}
