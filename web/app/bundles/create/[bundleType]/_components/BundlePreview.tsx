'use client';

import React from 'react';
import { Layout, Text, BlockStack, Badge } from '@shopify/polaris';
import type { CreateBundlePayload, BundleType } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    bundleType: BundleType;
}

export default function BundlePreview({ bundleData, bundleType }: Props) {
    return (
        <Layout>
            <Layout.Section>
                <BlockStack>
                    <Text variant="bodyMd" as="p">
                        Type: <Badge>{bundleType}</Badge>
                    </Text>

                    <Text variant="bodyMd" as="p">
                        Description: {bundleData.description || '-'}
                    </Text>

                    {bundleData.products && bundleData.products.length > 0 && (
                        <BlockStack>
                            {/*{bundleData.products.map((p) => (*/}
                            {/*    <Text variant="bodyMd" as="p" key={p.id}>*/}
                            {/*        {p.title} - ${p.price.toFixed(2)}*/}
                            {/*    </Text>*/}
                            {/*))}*/}
                        </BlockStack>
                    )}

                    {bundleData.discountValue ? (
                        <Text variant="bodyMd" as="p">
                            Discount: {bundleData.discountValue}
                            {bundleData.discountType === 'PERCENTAGE' ? '%' : '$'}
                        </Text>
                    ) : null}
                </BlockStack>
            </Layout.Section>
        </Layout>
    );
}