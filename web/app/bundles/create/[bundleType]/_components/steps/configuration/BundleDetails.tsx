// web/app/bundles/create/[bundleType]/_components/steps/configuration/BundleDetails.tsx
"use client";

import { BlockStack, Card, Text, TextField } from "@shopify/polaris";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

export default function BundleDetails() {
    const { watch, setValue, getFieldError } = useBundleFormMethods();

    const name = watch("name");
    const description = watch("description");

    const handleNameChange = (value: string) => {
        setValue("name", value, { shouldValidate: true, shouldDirty: true });
    };

    const handleDescriptionChange = (value: string) => {
        setValue("description", value, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Bundle Details
                </Text>

                <TextField
                    autoComplete="off"
                    label="Bundle Name"
                    value={name || ""}
                    onChange={handleNameChange}
                    placeholder="Enter bundle name"
                    error={getFieldError("name")}
                    requiredIndicator
                />

                <TextField
                    autoComplete="off"
                    label="Description (Optional)"
                    value={description || ""}
                    onChange={handleDescriptionChange}
                    multiline={3}
                    placeholder="Describe your bundle offer"
                    error={getFieldError("description")}
                />
            </BlockStack>
        </Card>
    );
}
