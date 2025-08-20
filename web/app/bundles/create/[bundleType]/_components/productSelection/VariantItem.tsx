"use client";

import React from "react";
import {
    BlockStack,
    Box,
    Checkbox,
    InlineStack,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import { Product, ProductVariant } from "@/types";
import { useProductSelectionStore } from "@/app/bundles/create/[bundleType]/_components/productSelection";

interface Props {
    product: Product;
    variant: ProductVariant;
}

export function VariantItem({ product, variant }: Props) {
    const { isVariantSelected, toggleVariantSelection } =
        useProductSelectionStore();

    const handleVariantToggle = () => {
        toggleVariantSelection(product, variant);
    };

    const renderPrice = () => {
        const price = parseFloat(variant.price).toFixed(2);
        const compareAtPrice = variant.compareAtPrice
            ? parseFloat(variant.compareAtPrice)
            : null;

        const hasDiscount =
            compareAtPrice && compareAtPrice > parseFloat(variant.price);

        return (
            <BlockStack gap="050" inlineAlign="end">
                <Text as="p" variant="bodySm" fontWeight="medium">
                    ৳{price}
                </Text>
                {hasDiscount && (
                    <Text
                        as="span"
                        variant="bodySm"
                        tone="subdued"
                        textDecorationLine="line-through"
                    >
                        ৳{compareAtPrice.toFixed(2)}
                    </Text>
                )}
            </BlockStack>
        );
    };

    return (
        <Box key={variant.id} padding="200">
            <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                    <Checkbox
                        label=""
                        checked={isVariantSelected(variant)}
                        onChange={handleVariantToggle}
                    />

                    {variant.image && (
                        <Thumbnail
                            source={variant.image.url}
                            alt={variant.image.altText || variant.title}
                            size="extraSmall"
                        />
                    )}

                    <BlockStack gap="050">
                        <Text as="p" variant="bodySm" fontWeight="medium">
                            {variant.title}
                        </Text>
                        <InlineStack gap="200">
                            {variant.sku && (
                                <Text as="p" variant="bodySm" tone="subdued">
                                    SKU: {variant.sku}
                                </Text>
                            )}
                            <Text as="p" variant="bodySm" tone="subdued">
                                {variant.inventoryQuantity} available
                            </Text>
                        </InlineStack>
                    </BlockStack>
                </InlineStack>

                {renderPrice()}
            </InlineStack>
        </Box>
    );
}
