"use client";

import {
    bundleCurrencyFormatter,
    DISCOUNT_TYPES,
    DiscountType,
    formatDiscountFromValues,
    SelectedProducts,
    useBundleField,
    useBundleStore,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";

export function BundleSummary() {
    const { bundleData, getGroupedItems } = useBundleStore();
    const groupedItems = getGroupedItems();
    const nameField = useBundleField<string>("name");
    const descriptionField = useBundleField<string>("description");

    const discountTypeField = useBundleField<string>("discountType");
    const discountValueField = useBundleField<number | undefined>(
        "discountValue",
    );

    const { isLoading, currencyCode } = useShopSettings();
    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
    const formatDiscount = () =>
        formatDiscountFromValues(
            discountTypeField.value as DiscountType,
            discountValueField.value,
            currencyFormatter,
        );

    const subtotal = groupedItems.reduce((sum, group) => {
        const productPrice = parseFloat(group.product.price ?? "0");
        const variantSum = group.variants.reduce(
            (s, v) => s + parseFloat(v.price ?? "0"),
            0,
        );
        return sum + productPrice + variantSum;
    }, 0);

    const discount =
        bundleData.discountType === "PERCENTAGE" && bundleData.discountValue
            ? (subtotal * bundleData.discountValue) / 100
            : bundleData.discountType === "FIXED_AMOUNT" &&
                bundleData.discountValue
              ? bundleData.discountValue
              : 0;

    const total = subtotal - discount;

    return (
        <s-stack gap="base">
            <s-section>
                <s-stack gap="small">
                    <s-stack>
                        <s-heading>Title</s-heading>
                        <s-text color="subdued">
                            {nameField.value || "Not set"}
                        </s-text>
                    </s-stack>

                    <s-stack>
                        <s-heading>Description</s-heading>
                        <div className="block">
                            <s-paragraph color="subdued">
                                {descriptionField.value || "Not set"}
                            </s-paragraph>
                        </div>
                    </s-stack>
                </s-stack>
            </s-section>

            <s-section>
                <s-stack gap="small-300">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                        gap="small-300"
                    >
                        <s-heading>Discount type</s-heading>
                        <s-text color="subdued">
                            {discountTypeField.value
                                ? DISCOUNT_TYPES[
                                      discountTypeField.value as keyof typeof DISCOUNT_TYPES
                                  ]?.label
                                : "Not set"}
                        </s-text>
                    </s-stack>
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                        gap="small-300"
                    >
                        <s-heading>Discount percentage</s-heading>
                        <s-text color="subdued">
                            {isLoading ? "•" : formatDiscount()}
                        </s-text>
                    </s-stack>
                </s-stack>
            </s-section>

            <s-section>
                <SelectedProducts />
            </s-section>

            <s-section>
                <s-stack gap="small">
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
                            <s-text color="subdued">
                                ${bundleData.minOrderValue}
                            </s-text>
                        </s-stack>
                    )}

                    {bundleData.maxDiscountAmount !== undefined && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                        >
                            <s-text color="subdued">Max Discount:</s-text>
                            <s-text color="subdued">
                                ${bundleData.maxDiscountAmount}
                            </s-text>
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
                                {new Date(
                                    bundleData.endDate,
                                ).toLocaleDateString()}
                            </s-text>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
