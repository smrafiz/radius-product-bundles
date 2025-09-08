import { useState } from "react";
import {
    Card,
    BlockStack,
    Text,
    Collapsible,
    InlineStack,
    Button,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

import { SelectedItem } from "@/types";
import { useBundleStore } from "@/stores";
import { useGroupedProducts } from "@/hooks";

export default function SelectedProductsAccordion() {
    const [open, setOpen] = useState(true);

    const selectedItems = useBundleStore((state) => state.selectedItems);
    const groupedItems = useGroupedProducts(selectedItems);

    return (
        <Card>
            {/* Header */}
            <InlineStack align="space-between" blockAlign="center" gap="300">
                <Text as="h2" variant="headingMd" fontWeight="medium">
                    Selected Products ({groupedItems.length})
                </Text>
                <Button
                    icon={open ? ChevronUpIcon : ChevronDownIcon}
                    onClick={() => setOpen(!open)}
                    accessibilityLabel={open ? "Collapse" : "Expand"}
                />
            </InlineStack>

            {/* Collapsible Body */}
            <Collapsible open={open} id="radius-selected-products">
                <BlockStack gap="400">
                    {groupedItems.map((group) => (
                        <Card key={group.product.productId} padding="300">
                            {/* Product Info */}
                            <InlineStack gap="300" blockAlign="center">
                                {group.product.image && (
                                    <img
                                        src={group.product.image}
                                        alt={group.product.title}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 4,
                                        }}
                                    />
                                )}
                                <BlockStack gap="100">
                                    <Text
                                        as="p"
                                        variant="bodyMd"
                                        fontWeight="medium"
                                    >
                                        {group.product.title}
                                    </Text>
                                    <Text tone="subdued" as="span">
                                        {group.product.vendor} •{" "}
                                        {group.product.productType}
                                    </Text>
                                    <Text as="span">
                                        ${group.product.price}
                                    </Text>
                                </BlockStack>
                            </InlineStack>

                            {/* Variants */}
                            {group.variants.map((variant: SelectedItem) => (
                                <InlineStack
                                    key={variant.variantId}
                                    gap="200"
                                    blockAlign="center"
                                >
                                    {variant.image && (
                                        <img
                                            src={variant.image}
                                            alt={variant.title}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 4,
                                            }}
                                        />
                                    )}
                                    <Text
                                        as="p"
                                        variant="bodyMd"
                                        fontWeight="medium"
                                    >
                                        {variant.title}
                                    </Text>
                                    <Text tone="subdued" as="span">
                                        ${variant.price}
                                    </Text>
                                </InlineStack>
                            ))}
                        </Card>
                    ))}
                </BlockStack>
            </Collapsible>
        </Card>
    );
}
