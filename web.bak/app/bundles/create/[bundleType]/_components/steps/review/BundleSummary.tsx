"use client";

import { Card, InlineStack, Text, BlockStack, Divider } from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import { useGroupedProducts } from "@/hooks";
import { getDiscountProperty } from "@/utils";

export default function BundleSummary() {
    const bundleData = useBundleStore((state) => state.bundleData);
    const selectedItems = useBundleStore((state) => state.selectedItems);
    const configuration = useBundleStore((state) => state.configuration);

    // Group selected items
    const groupedItems = useGroupedProducts(selectedItems);

    const formatDiscountValue = () => {
        if (!bundleData.discountValue) {
            return "0";
        }

        if (!bundleData.discountType) {
            return `${bundleData.discountValue}`;
        }

        const formatFunction = getDiscountProperty(bundleData.discountType, 'format');
        return formatFunction?.(bundleData.discountValue) || `${bundleData.discountValue}`;
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
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd" fontWeight="medium">
                    Bundle Summary
                </Text>

                {/* Name */}
                <InlineStack align="space-between">
                    <Text as="p" variant="bodySm" tone="subdued">
                        Name:
                    </Text>
                    <Text as="p" variant="bodySm">
                        {bundleData.name || "Not set"}
                    </Text>
                </InlineStack>

                {/* Description */}
                <InlineStack align="space-between">
                    <Text as="p" variant="bodySm" tone="subdued">
                        Description:
                    </Text>
                    <Text as="p" variant="bodySm">
                        {bundleData.description || "Not set"}
                    </Text>
                </InlineStack>

                {/* Discount Info */}
                <InlineStack align="space-between">
                    <Text as="p" variant="bodySm" tone="subdued">
                        Discount:
                    </Text>
                    <Text as="p" variant="bodySm">
                        {formatDiscountValue()}
                    </Text>
                </InlineStack>

                <Divider />

                {/* Subtotal without discount */}
                <InlineStack align="space-between">
                    <Text as="p" tone="subdued">
                        Subtotal
                    </Text>
                    <Text as="p">${subtotal.toFixed(2)}</Text>
                </InlineStack>

                {/* Discount */}
                {discount > 0 && (
                    <InlineStack align="space-between">
                        <Text as="p" tone="subdued">
                            Discount
                        </Text>
                        <Text as="p">- ${discount.toFixed(2)}</Text>
                    </InlineStack>
                )}

                {/* Total with discount */}
                <InlineStack align="space-between">
                    <Text as="p" fontWeight="medium">
                        Total
                    </Text>
                    <Text as="p" fontWeight="bold">
                        ${total.toFixed(2)}
                    </Text>
                </InlineStack>

                {/* Optional: min order, max discount, dates */}
                {bundleData.minOrderValue !== undefined && (
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Min Order:
                        </Text>
                        <Text as="p" variant="bodySm">
                            ${bundleData.minOrderValue}
                        </Text>
                    </InlineStack>
                )}

                {bundleData.maxDiscountAmount !== undefined && (
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Max Discount:
                        </Text>
                        <Text as="p" variant="bodySm">
                            ${bundleData.maxDiscountAmount}
                        </Text>
                    </InlineStack>
                )}

                {bundleData.startDate && (
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Start Date:
                        </Text>
                        <Text as="p" variant="bodySm">
                            {new Date(
                                bundleData.startDate,
                            ).toLocaleDateString()}
                        </Text>
                    </InlineStack>
                )}

                {bundleData.endDate && (
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            End Date:
                        </Text>
                        <Text as="p" variant="bodySm">
                            {new Date(bundleData.endDate).toLocaleDateString()}
                        </Text>
                    </InlineStack>
                )}
            </BlockStack>
        </Card>
    );
}
