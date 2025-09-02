"use client";

import React, { useState } from "react";
import {
    BlockStack,
    InlineStack,
    Popover,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import type { ProductGroup, SelectedItem } from "@/types";

interface Props {
    products: ProductGroup[];
    maxVisible?: number;
}

export default function ProductsPopover({
    products,
    maxVisible = 5,
}: Props) {
    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopover = () => setPopoverActive((active) => !active);

    const thumbnails = products
        .slice(0, maxVisible)
        .map((group) => (
            <Thumbnail
                key={group.product.productId}
                source={group.product.image || ""}
                alt={group.product.title}
                size="small"
            />
        ));

    const extraCount = products.length - maxVisible;

    return (
        <Popover
            active={popoverActive}
            activator={
                <div onClick={togglePopover} style={{ cursor: "pointer" }}>
                    <InlineStack gap="100" align="center">
                        {thumbnails}
                        {extraCount > 0 && (
                            <Text as="span" variant="bodySm">
                                +{extraCount}
                            </Text>
                        )}
                    </InlineStack>
                </div>
            }
            onClose={togglePopover}
        >
            <BlockStack gap="200">
                {products.map((group) => (
                    <BlockStack key={group.product.productId} gap="050">
                        <InlineStack blockAlign="center" gap="200">
                            <Thumbnail
                                source={group.product.image || ""}
                                alt={group.product.title}
                                size="small"
                            />
                            <BlockStack gap="050">
                                <Text
                                    as="p"
                                    variant="bodyMd"
                                    fontWeight="medium"
                                >
                                    {group.product.title}
                                </Text>
                                <a
                                    href={`/admin/products/${group.product.productId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "none" }}
                                >
                                    <Text
                                        as="span"
                                        variant="bodySm"
                                        tone="interactive"
                                    >
                                        Edit Product
                                    </Text>
                                </a>
                            </BlockStack>
                        </InlineStack>

                        {group.variants.length > 0 &&
                            group.variants.map((variant: SelectedItem) => (
                                <InlineStack
                                    key={variant.variantId}
                                    blockAlign="center"
                                    gap="150"
                                >
                                    <Thumbnail
                                        source={variant.image || ""}
                                        alt={variant.title}
                                        size="small"
                                    />
                                    <Text as="p" variant="bodySm">
                                        {variant.title} (${variant.price})
                                    </Text>
                                </InlineStack>
                            ))}
                    </BlockStack>
                ))}
            </BlockStack>
        </Popover>
    );
}
