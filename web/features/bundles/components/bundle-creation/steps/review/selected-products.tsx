"use client";

import { useMemo, useState } from "react";
import { useBundleStore } from "@/features/bundles";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { BlockStack, Button, Card, Collapsible, InlineStack, Text, } from "@shopify/polaris";

/**
 * Selected Products Component
 */
export function SelectedProducts() {
    const { getGroupedItems } = useBundleStore();
    const [open, setOpen] = useState(false);

    const groupedItems = getGroupedItems();
    const itemCount = useMemo(() => groupedItems.length, [groupedItems.length]);
    const handleToggle = () => setOpen((prev) => !prev);

    if (itemCount === 0) {
        return null;
    }

    return (
        <BlockStack gap="300">
            {/* Header */}
            <InlineStack align="space-between" blockAlign="center" gap="300">
                <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Selected Products ({itemCount})
                </Text>
                <Button
                    icon={open ? ChevronUpIcon : ChevronDownIcon}
                    onClick={handleToggle}
                    variant="plain"
                    accessibilityLabel={
                        open ? "Collapse products" : "Expand products"
                    }
                />
            </InlineStack>

            {/* Collapsible Body */}
            <Collapsible
                open={open}
                id="radius-selected-products"
                transition={{
                    duration: "200ms",
                    timingFunction: "ease-in-out",
                }}
            >
                <BlockStack gap="300">
                    {groupedItems.map((group) => (
                        <Card key={group.product.productId} padding="300">
                            <BlockStack gap="300">
                                {/* Product Header */}
                                <InlineStack gap="300" blockAlign="center" wrap={false}>
                                    {group.product.image && (
                                        <img
                                            src={group.product.image}
                                            alt={group.product.title}
                                            width="40"
                                            height="40"
                                            style={{
                                                borderRadius: 4,
                                                objectFit: "cover",
                                            }}
                                            loading="lazy"
                                        />
                                    )}
                                    <BlockStack gap="100">
                                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                                            {group.product.title}
                                        </Text>
                                        {(group.product.vendor || group.product.productType) && (
                                            <Text tone="subdued" as="span" variant="bodySm">
                                                {[group.product.vendor, group.product.productType]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </Text>
                                        )}
                                        {group.product.price && (
                                            <Text
                                                as="span"
                                                variant="bodyMd"
                                                fontWeight="medium"
                                            >
                                                ${group.product.price}
                                            </Text>
                                        )}
                                    </BlockStack>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    ))}
                </BlockStack>
            </Collapsible>
        </BlockStack>
    );
}
