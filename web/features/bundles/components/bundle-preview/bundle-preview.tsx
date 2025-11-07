"use client";

import {
    BundlePreviewStatus,
    BundleType,
    useBundleStore,
} from "@/features/bundles";
import {
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    formatPrice,
} from "@/utils/bundle/bundleUtils";

export function BundlePreview({ bundleType }: { bundleType: BundleType }) {
    const { bundleData, selectedItems, displaySettings } = useBundleStore();

    const renderSelectedProducts = () => {

        // Show actual selected products (limit to first 4 for space)
        return selectedItems.slice(0, 4).map((item, index) => (
            <s-stack
                key={index}
                gap="base"
                alignItems="center"
                direction="inline"
                background="subdued"
                border="base"
                borderRadius="base"
                padding="small"
            >
                <s-stack>
                    <s-box inlineSize="70px">
                        <s-image
                            src={item.image}
                            alt={item.title}
                            aspectRatio="70/70"
                            inlineSize="auto"
                        />
                    </s-box>
                </s-stack>
                <s-stack>
                    <s-heading>
                        {item.title.length > 25
                            ? `${item.title.substring(0, 25)}...`
                            : item.title}
                    </s-heading>
                    <s-text>
                        Qty: {item.quantity} ×{" "}
                        {formatPrice(parseFloat(item.price))}
                    </s-text>
                </s-stack>
            </s-stack>
        ));
    };

    const calculatePreviewPricing = () => {
        if (
            selectedItems.length === 0 ||
            !bundleData.discountType ||
            !bundleData.discountValue
        ) {
            // Show placeholder values when no products selected or discount configured
            return {
                originalPrice: 300,
                discountAmount: 30,
                finalPrice: 270,
                savingsPercentage: 10,
            };
        }

        const originalPrice = calculateBundlePrice(selectedItems);
        const discountAmount = calculateDiscountAmount(
            originalPrice,
            bundleData.discountType,
            bundleData.discountValue,
            bundleData.maxDiscountAmount,
        );
        const finalPrice = Math.max(0, originalPrice - discountAmount);
        const savingsPercentage = calculateSavingsPercentage(
            originalPrice,
            finalPrice,
        );

        return {
            originalPrice,
            discountAmount,
            finalPrice,
            savingsPercentage,
        };
    };

    const { originalPrice, discountAmount, finalPrice, savingsPercentage } =
        calculatePreviewPricing();

    return (
        <s-stack gap="base">

            {/* Bundle preview status */}
            <BundlePreviewStatus />

            <s-section>
                <s-stack gap="base">
                    <s-stack gap="base">
                        <s-heading>
                            {displaySettings.title ||
                                bundleData.name ||
                                "Frequently Bought Together"}
                        </s-heading>

                        {/* Product Images */}
                        <s-stack gap="small-200">
                            {renderSelectedProducts()}
                        </s-stack>

                        {/* Product quantity summary for multiple products */}
                        {selectedItems.length > 4 && (
                            <s-text>
                                + {selectedItems.length - 4} more products
                            </s-text>
                        )}

                        <s-divider />

                        {/* Pricing */}
                        <s-stack gap="small-200">
                            {displaySettings.showPrices && (
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                >
                                    <s-stack
                                        gap="small-200"
                                        direction="inline"
                                        justifyContent="space-between"
                                    >
                                        <s-heading>Original Price:</s-heading>
                                        {discountAmount > 0 && (
                                            <s-text>
                                                <div>
                                                    {formatPrice(originalPrice)}
                                                </div>
                                            </s-text>
                                        )}
                                    </s-stack>

                                    <s-stack
                                        gap="small-200"
                                        direction="inline"
                                        justifyContent="space-between"
                                    >
                                        <s-heading>Total Price:</s-heading>
                                        <s-text>
                                            {formatPrice(finalPrice)}
                                        </s-text>
                                    </s-stack>
                                </s-stack>
                            )}

                            {displaySettings.showSavings &&
                                discountAmount > 0 && (
                                    <s-stack
                                        gap="small-200"
                                        direction="inline"
                                        justifyContent="space-between"
                                    >
                                        <s-text tone="success">
                                            You save:
                                        </s-text>
                                        <s-text tone="success">
                                            {formatPrice(discountAmount)} (
                                            {savingsPercentage}%)
                                        </s-text>
                                    </s-stack>
                                )}
                        </s-stack>

                        <s-button variant="primary">
                            Add Bundle to Cart
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>
        </s-stack>
    );
}
