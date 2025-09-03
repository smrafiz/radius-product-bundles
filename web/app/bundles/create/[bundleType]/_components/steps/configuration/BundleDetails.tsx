"use client";

import React from "react";
import { useBundleStore } from "@/stores";
import { useBundleValidation } from "@/hooks";
import { BlockStack, Card, Text, TextField } from "@shopify/polaris";

export default function BundleDetails() {
    const { bundleData, updateBundleField } = useBundleStore();
    const { getFieldError } = useBundleValidation();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Bundle Details
                </Text>

                <TextField
                    autoComplete="off"
                    label="Bundle Name"
                    value={bundleData.name || ""}
                    onChange={(value) => updateBundleField("name", value)}
                    placeholder="Enter bundle name"
                    error={getFieldError("name") || undefined}
                    requiredIndicator
                />

                <TextField
                    autoComplete="off"
                    label="Description (Optional)"
                    value={bundleData.description || ""}
                    onChange={(value) =>
                        updateBundleField("description", value)
                    }
                    multiline={3}
                    placeholder="Describe your bundle offer"
                />
            </BlockStack>
        </Card>
    );
}
