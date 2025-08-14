// steps/DiscountStep.tsx
'use client';
import React from 'react';
import { Layout, TextField, Select } from '@shopify/polaris';
import type { CreateBundlePayload } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    setBundleData: React.Dispatch<React.SetStateAction<Partial<CreateBundlePayload>>>;
}

export default function DiscountStep({ bundleData, setBundleData }: Props) {
    return (
        <Layout>
            <Layout.Section>
                <Select
                    label="Discount Type"
                    options={[
                        { label: 'Percentage', value: 'PERCENTAGE' },
                        { label: 'Fixed', value: 'FIXED' },
                    ]}
                    value={bundleData.discountType || 'PERCENTAGE'}
                    onChange={(value) =>
                        setBundleData((prev) => ({ ...prev, discountType: value as 'PERCENTAGE' | 'FIXED' }))
                    }
                />
                <TextField
                    label="Discount Value"
                    type="number"
                    value={bundleData.discountValue?.toString() || '0'}
                    onChange={(value) => setBundleData((prev) => ({ ...prev, discountValue: parseFloat(value) }))}
                />
            </Layout.Section>
        </Layout>
    );
}