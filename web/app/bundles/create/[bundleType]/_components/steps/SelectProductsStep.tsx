// steps/SelectProductsStep.tsx
'use client';
import React from 'react';
import { Layout, TextField, BlockStack, Button } from '@shopify/polaris';
import type { CreateBundlePayload } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    setBundleData: React.Dispatch<React.SetStateAction<Partial<CreateBundlePayload>>>;
}

export default function SelectProductsStep({ bundleData, setBundleData }: Props) {
    const addProduct = () => {
        setBundleData((prev) => ({
            ...prev,
            products: [...(prev.products || []), { id: Date.now().toString(), title: 'New Product', price: 0 }],
        }));
    };

    const updateProduct = (index: number, key: 'title' | 'price', value: string | number) => {
        setBundleData((prev) => {
            const products = [...(prev.products || [])];
            products[index] = { ...products[index], [key]: value };
            return { ...prev, products };
        });
    };

    return (
        <Layout>
            <Layout.Section>
                <BlockStack >
                    {bundleData.products?.map((p, idx) => (
                        <BlockStack alignment="center">
                            <TextField
                                label="Title"
                                // value={p.title}
                                onChange={(value) => updateProduct(idx, 'title', value)}
                            />
                            <TextField
                                label="Price"
                                type="number"
                                // value={p.price.toString()}
                                onChange={(value) => updateProduct(idx, 'price', parseFloat(value))}
                            />
                        </BlockStack>
                    ))}
                    <Button onClick={addProduct}>Add Product</Button>
                </BlockStack>
            </Layout.Section>
        </Layout>
    );
}