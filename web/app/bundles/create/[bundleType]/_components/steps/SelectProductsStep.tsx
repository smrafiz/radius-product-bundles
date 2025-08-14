// steps/SelectProductsStep.tsx
'use client';

import React from 'react';
import { Layout, Text, Button } from '@shopify/polaris';
import { useBundleStore } from "@/lib/stores/bundleStore";

export default function SelectProductsStep() {
    const { bundleData, updateBundleField } = useBundleStore();

    const addDummyProduct = () => {
        const newProduct = { id: Date.now().toString(), title: 'Sample Product', price: 19.99 };
        updateBundleField('products', [...(bundleData.products || []), newProduct]);
    };

    return (
        <Layout.Section>
            <Text variant="bodyMd" as="h2">Selected Products:</Text>
            <ul className="mt-2 mb-4">
                {bundleData.products?.map((p) => (
                    <li key={p.id}>
                        {p.title} - ${p.price.toFixed(2)}
                    </li>
                ))}
            </ul>
            <Button onClick={addDummyProduct}>Add Sample Product</Button>
        </Layout.Section>
    );
}