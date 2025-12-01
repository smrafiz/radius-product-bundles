"use client";

import {
    BundlePreviewStatus,
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    formatPrice,
    useBundleStore,
} from "@/features/bundles";

export function BundlePreview() {
    const { bundleData, selectedItems, displaySettings } = useBundleStore();

    const renderSelectedProducts = () => {
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
                    <div className="w-20 h-20 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                        <s-image
                            src={item.image}
                            alt={item.title}
                            aspectRatio="80/80"
                            inlineSize="auto"
                            objectFit="cover"
                        />
                    </div>
                </s-stack>
                <s-stack>
                    <s-heading>
                        {item.title.length > 25
                            ? `${item.title.slice(0, 25)}...`
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
                    <s-heading>Frequently bought together</s-heading>
                    {selectedItems.length > 0 ? (
                    <s-stack gap="base">
                        <s-stack gap="small-200">
                            {renderSelectedProducts()}
                        </s-stack>
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
                                        <s-text>You save:</s-text>
                                        <s-text>
                                            {formatPrice(discountAmount)} (
                                            {savingsPercentage}%)
                                        </s-text>
                                    </s-stack>
                                )}
                        </s-stack>

                        <s-button variant="primary">
                            Add bundle to cart
                        </s-button>
                    </s-stack>

                    ) : <div className="min-h-96 flex flex-col items-center justify-center gap-3">
                        <div className="w-[var(--p-font-size-1000)]">
                            <s-image
                                src="/assets/not-found.svg"
                                alt="Four pixelated characters ready to build amazing Shopify apps"
                                aspectRatio="1/1"
                                inlineSize="auto"
                            />
                        </div>
                        <s-text color="subdued">Please choose product to see the bundle preview</s-text>
                    </div>}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
