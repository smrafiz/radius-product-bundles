"use client";

import { useState, useCallback } from "react";
import {
    Popover,
    ActionList,
    Thumbnail,
    InlineStack,
    Text,
    Box,
    ResourceList,
    ResourceItem,
} from "@shopify/polaris";
import { BundleListItem } from "@/types";

interface BundleProductsPreviewProps {
    bundle: BundleListItem;
}

export default function BundleProductsPreview({ bundle }: BundleProductsPreviewProps) {
    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopover = useCallback(() =>
        setPopoverActive((active) => !active), []
    );

    // Use pre-fetched products from bundle data
    const displayProducts = bundle.products.slice(0, 3);
    const remainingCount = Math.max(0, bundle.products.length - 3);

    const activator = (
        <div
            onClick={togglePopover}
            style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}
        >
            <InlineStack gap="100" align="center">
                {displayProducts.map((product, index) => (
                    <Box key={product.id} position="relative">
                        <Thumbnail
                            source={product.featuredImage || ''}
                            alt={product.title}
                            size="small"
                        />
                        {index === 2 && remainingCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                borderRadius: '3px'
                            }}>
                                +{remainingCount}
                            </div>
                        )}
                    </Box>
                ))}
                <Text variant="bodyMd" as="span" tone="subdued">
                    ({bundle.productCount})
                </Text>
            </InlineStack>
        </div>
    );

    return (
        <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopover}
            preferredAlignment="left"
        >
            <Box padding="200" minWidth="280px" maxHeight="300px">
                <ResourceList
                    resourceName={{ singular: 'product', plural: 'products' }}
                    items={bundle.products}
                    renderItem={(product) => {
                        const media = (
                            <Thumbnail
                                source={product.featuredImage || ''}
                                alt={product.title}
                                size="small"
                            />
                        );

                        return (
                            <ResourceItem
                                id={product.id}
                                media={media}
                                onClick={() => {
                                    console.log('Product clicked:', product.title);
                                }}
                            >
                                <Text variant="bodyMd" fontWeight="medium">
                                    {product.title}
                                </Text>
                            </ResourceItem>
                        );
                    }}
                />
            </Box>
        </Popover>
    );
}