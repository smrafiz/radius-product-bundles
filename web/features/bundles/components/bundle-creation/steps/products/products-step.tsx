"use client";
import {
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
        <s-section>
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
                        Add Products
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

                <ProductList />
            </s-stack>
        </s-section>
    );
}
