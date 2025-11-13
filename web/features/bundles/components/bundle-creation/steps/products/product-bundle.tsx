"use client";

import { useState } from "react";

export function ProductBundle() {
    const [show, setShow] = useState<boolean>(false);
    return (
        <s-stack gap="base">
            <s-heading>Bundle as product</s-heading>
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
                background="subdued"
                padding="small"
                borderRadius="large"
            >
                <s-text>
                    {show ? 'This bundle is linked to a product with its own product page.' :'This bundle creates a product with its own product page.'}
                </s-text>
                <s-button variant="secondary" onClick={() => setShow(!show)}>
                    {show ? 'Delete product' : 'Create product'}
                </s-button>
            </s-stack>
            {show && (
                <s-stack gap="base">
                    <s-text-field label="Title" value="" />

                    <s-text-area
                        label="Product Description"
                        value="1776 Barnes Street, Orlando, FL 32801"
                        rows={3}
                    />

                    <s-select label="How to show the bundle in cart, checkout and order">
                        <s-option value="1">
                            Show the bundle as a single product (Single)
                        </s-option>
                        <s-option value="2">
                            Show the bundle as included products (Multi)
                        </s-option>
                        <s-option value="3">
                            Show the bundle as single product, but apply a
                            discount (Single with Discount)
                        </s-option>
                    </s-select>

                    <s-divider />

                    <s-stack gap="base">
                        <s-heading>Other product details</s-heading>
                        <s-text>
                            To edit other product details visit the product page
                            in your Shopify admin.
                        </s-text>
                        <s-button disabled>Edit product on Shopify</s-button>
                        <s-banner>
                            Save the bundle before editing the associated
                            Shopify product.
                        </s-banner>
                    </s-stack>
                </s-stack>
            )}
        </s-stack>
    );
}
