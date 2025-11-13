"use client";

import { ProductListPopoverProps } from "@/features/bundles";

/**
 * Product list popover
 *
 * Uses Polaris web components
 */
export function ProductListPopover({ products }: ProductListPopoverProps) {
    return (
        <s-box padding="base">
            <s-stack gap="small">
                {products.map((product) => (
                    <s-stack
                        key={product.id}
                        direction="inline"
                        gap="small"
                        rowGap="small-300"
                        alignItems="center"
                    >
                        {/* Product image */}
                        {product.featuredImage?.url ? (
                            <s-thumbnail
                                src={product.featuredImage.url}
                                alt={
                                    product.featuredImage.altText ||
                                    product.title
                                }
                                size="small"
                            />
                        ) : (
                            <div className="w-100 h-100 flex justify-center items-center">
                                <s-icon type="image" />
                            </div>
                        )}

                        {/* Product title */}
                        <s-text type="strong">{product.title}</s-text>
                    </s-stack>
                ))}
            </s-stack>
        </s-box>
    );
}
