"use client";

import React from "react";
import { BlockStack, Text } from "@shopify/polaris";
import {
    BundleBehavior,
    BundleDetails,
    DiscountSettings,
} from "@/bundles/create/[bundleType]/_components/steps/configuration";

export default function ConfigurationStep() {
    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Configuration
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                    Set up discount rules and bundle behavior
                </Text>
            </BlockStack>

            <BundleDetails />
            <DiscountSettings />
            <BundleBehavior />
        </BlockStack>
    );
}
