"use client";

import React, { forwardRef } from "react";
import {
    BlockStack,
    Box,
    Card,
    InlineStack,
    Spinner,
    Text,
} from "@shopify/polaris";
import { ProductItem } from "@/app/bundles/create/[bundleType]/_components/productSelection";

import { Product } from "@/types";

interface Props {
    products: Product[];
    selectedProductIds: string[];
    isLoading: boolean;
    error?: Error | null;
    nextCursor: string | null;
    isLoadingMore: boolean;
}

export const ProductList = forwardRef<HTMLDivElement, Props>(
    (
        {
            products,
            selectedProductIds,
            isLoading,
            error,
            nextCursor,
            isLoadingMore,
        },
        ref,
    ) => {
        if (isLoading) {
            return (
                <Card padding="0">
                    <div className="h-[500px] min-h-[500px]">
                        <Box padding="0">
                            <InlineStack align="center" blockAlign="center">
                                <div className="flex items-center h-[500px] min-h-[500px]">
                                    <Spinner accessibilityLabel="Loading products" size="large" />
                                </div>
                            </InlineStack>
                        </Box>
                    </div>
                </Card>
            );
        }

        if (error) {
            return (
                <Card padding="0">
                    <div className="h-[500px] min-h-[500px] overflow-auto border border-gray-200 rounded-md">
                        <Box padding="400">
                            <Text as="p" variant="bodyMd" tone="critical">
                                Error loading products. Please try again.
                            </Text>
                        </Box>
                    </div>
                </Card>
            );
        }

        return (
            <Card padding="0">
                <div
                    className="h-[500px] min-h-[500px] overflow-auto border border-gray-200 rounded-md"
                    ref={ref}
                >
                    {products.length === 0 ? (
                        <Box padding="0">
                            <InlineStack align="center">
                                <div className="flex items-center h-[500px] min-h-[500px]">
                                    <Text as="p" variant="bodyLg" tone="subdued">
                                        No products found
                                    </Text>
                                </div>
                            </InlineStack>
                        </Box>
                    ) : (
                        <BlockStack gap="0">
                            {products.map((product, index) => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    isLast={index === products.length - 1}
                                    isDisabled={selectedProductIds.includes(product.id)}
                                />
                            ))}

                            {/* Loading more indicator */}
                            {nextCursor && isLoadingMore && (
                                <Box padding="400">
                                    <InlineStack align="center">
                                        <Spinner size="small" />
                                    </InlineStack>
                                </Box>
                            )}

                            {/* End of result indicator */}
                            {!nextCursor && products.length > 10 && (
                                <Box padding="400">
                                    <InlineStack align="center">
                                        <Text as="p" variant="bodySm" tone="subdued">
                                            All products loaded ({products.length} total)
                                        </Text>
                                    </InlineStack>
                                </Box>
                            )}
                        </BlockStack>
                    )}
                </div>
            </Card>
        );
    },
);

ProductList.displayName = "ProductList";
export default ProductList;