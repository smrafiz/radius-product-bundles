// web/app/bundles/create/[bundleType]/_components/steps/ReviewStep.tsx
"use client";

import React from "react";
import { BlockStack, Card, Text } from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import BundleSummary from "./BundleSummary";

export default function ReviewStep() {
    const { bundleData } = useBundleStore();

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Review & Publish
            </Text>

            <Text as="p" variant="bodySm" tone="subdued">
                Review your bundle settings and publish when ready.
            </Text>

            <BundleSummary />

            {bundleData.description && (
                <Card>
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                            Description
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                            {bundleData.description}
                        </Text>
                    </BlockStack>
                </Card>
            )}
        </BlockStack>
    );
}