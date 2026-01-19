"use client";

import {
    BUNDLE_STATUSES,
    bundleCurrencyFormatter,
    DISCOUNT_TYPES,
    DiscountType,
    formatDiscountFromValues,
    SelectedProducts,
    useBundleField,
    useBundlePreviewPricing,
    useBundleStore,
} from "@/features/bundles";
import { formatDateLong, useShopSettings } from "@/shared";

/**
 * Displays a summary of the bundle configuration in the review step.
 */
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

    // Use the pricing hook for consistent calculations
    const {
        originalPrice: subtotal,
        discountAmount: discount,
        finalPrice: total,
    } = useBundlePreviewPricing();

    /**
     * Formats the discount display text.
     */
    const formatDiscount = () =>
        formatDiscountFromValues(
            discountTypeField.value as DiscountType,
            discountValueField.value,
            currencyFormatter,
        );

    /**
     * Converts a date value to a Date object.
     */
    const toDate = (value: Date | string | undefined): Date | undefined => {
        if (!value) {
            return undefined;
        }

        if (value instanceof Date) {
            return value;
        }

        return new Date(value);
    };

    /**
     * Formats a date for display.
     */
    const formatDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) {
            return "Not set";
        }

        const dateStr = dateObj.toISOString().split("T")[0];
        return formatDateLong(dateStr);
    };

    // Get status badge info
    const statusInfo = bundleData.status
        ? BUNDLE_STATUSES[bundleData.status]
        : BUNDLE_STATUSES.DRAFT;

    return (
        <s-stack gap="base">
            {/* Bundle Details Section */}
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

            {/* Discount Section */}
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
                        <s-heading>Discount value</s-heading>
                        <s-text color="subdued">
                            {isLoading ? "•" : formatDiscount()}
                        </s-text>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Status Section */}
            <s-section>
                <s-stack gap="small">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-heading>Status</s-heading>
                        <s-badge tone={statusInfo.tone}>
                            {statusInfo.text}
                        </s-badge>
                    </s-stack>

                    {bundleData.status === "SCHEDULED" && (
                        <s-stack gap="small-200">
                            <s-stack
                                alignItems="center"
                                justifyContent="space-between"
                                direction="inline"
                            >
                                <s-text color="subdued">Start Date</s-text>
                                <s-text>
                                    {formatDate(bundleData.startDate)}
                                </s-text>
                            </s-stack>
                            <s-stack
                                alignItems="center"
                                justifyContent="space-between"
                                direction="inline"
                            >
                                <s-text color="subdued">End Date</s-text>
                                <s-text>
                                    {formatDate(bundleData.endDate)}
                                </s-text>
                            </s-stack>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>

            {/* Products Section */}
            <s-section>
                <SelectedProducts />
            </s-section>

            {/* Pricing Section */}
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

                    {/* Optional: min order, max discount */}
                    {bundleData.minOrderValue !== undefined && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                        >
                            <s-text color="subdued">Min Order</s-text>
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
                            <s-text color="subdued">Max Discount</s-text>
                            <s-text color="subdued">
                                ${bundleData.maxDiscountAmount}
                            </s-text>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
