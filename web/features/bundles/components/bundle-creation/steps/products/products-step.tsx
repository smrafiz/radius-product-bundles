"use client";

import {
    BundleDetails,
    BundleType,
    ProductList,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useEffect } from "react";
import { useProductPicker } from "@/shared";
import { useFormContext } from "react-hook-form";
import { useSettingsStore } from "@/features/settings";

export function ProductsStep({ bundleType }: { bundleType: BundleType }) {
    const { selectedItems, setSelectedItems, validationAttempted } =
        useBundleStore();
    const { getAllErrors } = useBundleValidation();
    const { openProductPicker, isLoading } = useProductPicker();
    const { clearErrors } = useFormContext();

    const settingsData = useSettingsStore(
        (state) => state.localData ?? state.serverData,
    );
    const maxProducts = (settingsData?.maxBundleProducts as number) ?? 10;
    const isAtLimit = selectedItems.length >= maxProducts;

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
                <BundleDetails bundleType={bundleType} />
            </s-section>

            {/* Bundle product list */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Select products</s-heading>
                        {selectedItems.length > 0 && (
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                                gap="small-300"
                            >
                                <s-button
                                    variant="primary"
                                    icon="plus"
                                    onClick={openProductPicker}
                                    loading={isLoading}
                                    disabled={isAtLimit}
                                    tone={
                                        hasProductError ? "critical" : undefined
                                    }
                                >
                                    Add products
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    tone="critical"
                                    icon="delete"
                                    onClick={handleClearAll}
                                >
                                    Clear all
                                </s-button>
                            </s-stack>
                        )}
                    </s-stack>
                    {productErrorMessage && (
                        <s-banner tone="critical" data-fieldid="products">
                            {productErrorMessage}
                        </s-banner>
                    )}
                    {showProductHint && (
                        <s-banner tone="info">
                            Add at least one more product to create a bundle. (
                            {selectedItems.length}/2 minimum)
                        </s-banner>
                    )}
                    {isAtLimit && (
                        <s-banner tone="warning">
                            Maximum {maxProducts} products reached for this
                            bundle.
                        </s-banner>
                    )}
                    <ProductList />
                </s-stack>
            </s-section>
        </s-stack>
    );
}
