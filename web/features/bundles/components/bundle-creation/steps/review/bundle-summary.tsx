"use client";

import {
    getDiscountProperty,
    SelectedProducts,
    useBundleStore,
} from "@/features/bundles";

export function BundleSummary() {
    const { bundleData, getGroupedItems } = useBundleStore();
    const groupedItems = getGroupedItems();

    const formatDiscountValue = () => {
        if (!bundleData.discountValue) {
            return "0";
        }

        if (!bundleData.discountType) {
            return `${bundleData.discountValue}`;
        }

        const formatFunction = getDiscountProperty(
            bundleData.discountType,
            "format",
        );
        return (
            formatFunction?.(bundleData.discountValue) ||
            `${bundleData.discountValue}`
        );
    };

    // Calculate subtotal (sum of all products and variants)
    const subtotal = groupedItems.reduce((sum, group) => {
        const productPrice = parseFloat(group.product.price ?? "0");
        const variantSum = group.variants.reduce(
            (s, v) => s + parseFloat(v.price ?? "0"),
            0,
        );
        return sum + productPrice + variantSum;
    }, 0);

    // Calculate discount
    const discount =
        bundleData.discountType === "PERCENTAGE" && bundleData.discountValue
            ? (subtotal * bundleData.discountValue) / 100
            : bundleData.discountType === "FIXED_AMOUNT" &&
                bundleData.discountValue
              ? bundleData.discountValue
              : 0;

    const total = subtotal - discount;

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Bundle summary</s-heading>

                {/* Name */}
                <s-stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="inline"
                >
                    <s-text color="subdued">Name:</s-text>
                    <s-text color="subdued">{bundleData.name || "Not set"}</s-text>
                </s-stack>

                {/* Description */}
                <s-stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="inline"
                >
                    <s-text color="subdued">Description:</s-text>
                    <s-text color="subdued">{bundleData.description || "Not set"}</s-text>
                </s-stack>

                {/* Discount Info */}
                <s-stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="inline"
                >
                    <s-text color="subdued">Discount:</s-text>
                    <s-text color="subdued">{formatDiscountValue()}</s-text>
                </s-stack>

                <s-divider />

                <SelectedProducts />

                <s-divider />

                {/* Subtotal without discount */}
                <s-stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="inline"
                >
                    <s-text>Subtotal</s-text>
                    <s-text>${subtotal.toFixed(2)}</s-text>
                </s-stack>

                {/* Discount */}
                {discount > 0 && (
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text>Discount</s-text>
                        <s-text>- ${discount.toFixed(2)}</s-text>
                    </s-stack>
                )}

                {/* Total with discount */}
                <s-stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="inline"
                >
                    <s-text type="strong">Total</s-text>
                    <s-text type="strong">${total.toFixed(2)}</s-text>
                </s-stack>

                {/* Optional: min order, max discount, dates */}
                {bundleData.minOrderValue !== undefined && (
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text color="subdued">Min Order:</s-text>
                        <s-text color="subdued">${bundleData.minOrderValue}</s-text>
                    </s-stack>
                )}

                {bundleData.maxDiscountAmount !== undefined && (
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text color="subdued">Max Discount:</s-text>
                        <s-text color="subdued">${bundleData.maxDiscountAmount}</s-text>
                    </s-stack>
                )}

                {bundleData.startDate && (
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text color="subdued">Start Date:</s-text>
                        <s-text color="subdued">
                            {new Date(
                                bundleData.startDate,
                            ).toLocaleDateString()}
                        </s-text>
                    </s-stack>
                )}

                {bundleData.endDate && (
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text color="subdued">End Date:</s-text>
                        <s-text color="subdued">
                            {new Date(bundleData.endDate).toLocaleDateString()}
                        </s-text>
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
