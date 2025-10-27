"use client";

import {
    Box,
    ResourceList,
    ResourceItem,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import { ProductListPopoverProps } from "@/features/bundles";

/**
 * Product list popover
 */
export function ProductListPopover({ products }: ProductListPopoverProps) {
    return (
        <Box padding="200" minWidth="280px">
            <ResourceList
                resourceName={{ singular: "product", plural: "products" }}
                items={products}
                renderItem={(product) => {
                    const media = (
                        <Thumbnail
                            source={product.featuredImage?.url || ""}
                            alt={product.featuredImage?.altText || product.title}
                            size="small"
                        />
                    );

                    return (
                        <ResourceItem
                            id={product.id}
                            key={product.id}
                            media={media}
                            verticalAlignment="center"
                            onClick={() => {
                                console.log("Product clicked:", product.title);
                            }}
                        >
                            <div className="flex items-center">
                                <Text
                                    as="h4"
                                    variant="bodyMd"
                                    fontWeight="medium"
                                >
                                    {product.title}
                                </Text>
                            </div>
                        </ResourceItem>
                    );
                }}
            />
        </Box>
    );
}
