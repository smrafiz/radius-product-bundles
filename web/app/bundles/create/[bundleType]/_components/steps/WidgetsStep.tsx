// steps/WidgetsStep.tsx
'use client';
import React from 'react';
import { Layout, TextField } from '@shopify/polaris';
import type { CreateBundlePayload } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    setBundleData: React.Dispatch<React.SetStateAction<Partial<CreateBundlePayload>>>;
}

export default function WidgetsStep({ bundleData, setBundleData }: Props) {
    return (
        <Layout title="Widget Settings">
            <Layout.Section>
                <TextField
                    label="Bundle Name"
                    value={bundleData.name || ''}
                    onChange={(value) => setBundleData((prev) => ({ ...prev, name: value }))}
                />
                <TextField
                    label="Description"
                    value={bundleData.description || ''}
                    onChange={(value) => setBundleData((prev) => ({ ...prev, description: value }))}
                    multiline
                />
            </Layout.Section>
        </Layout>
    );
}