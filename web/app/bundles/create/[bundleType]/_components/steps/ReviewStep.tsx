// steps/ReviewStep.tsx
'use client';
import React from 'react';
import { Layout, Text, Stack } from '@shopify/polaris';
import type { CreateBundlePayload } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    setBundleData: React.Dispatch<React.SetStateAction<Partial<CreateBundlePayload>>>;
}

export default function ReviewStep({ bundleData }: Props) {
    return (
        <Layout>
            <Layout.Section>
                <Stack vertical spacing="tight">
                    <Text as="h2" variant="bodyMd">Name: {bundleData.name || '-'}</Text>
                    <Text as="h2" variant="bodyMd">Description: {bundleData.description || '-'}</Text>
                    <Text as="h2" variant="bodyMd">
                        Discount: {bundleData.discountValue} {bundleData.discountType === 'PERCENTAGE' ? '%' : '$'}
                    </Text>
                    <Text as="h2" variant="bodyMd">Products:</Text>
                    {/*{bundleData.products?.map((p) => (*/}
                    {/*    <Text key={p.id}>- {p.title} (${p.price})</Text>*/}
                    {/*))}*/}
                </Stack>
            </Layout.Section>
        </Layout>
    );
}