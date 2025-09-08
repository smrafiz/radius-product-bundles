// web/app/bundles/create/[bundleType]/_components/steps/configuration/BundleDetails.tsx
"use client";

import { BlockStack, Card, Text, TextField } from "@shopify/polaris";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";
import { useBundleValidation } from "@/hooks/bundle/useBundleValidation";
import { useBundleStore } from "@/stores";

export default function BundleDetails() {
    const { watch, setValue } = useBundleFormMethods();
    const { getFieldError } = useBundleValidation();
    const { markDirty } = useBundleStore();

    const name = watch("name");
    const description = watch("description");

    const handleNameChange = (value: string) => {
        setValue("name", value, { shouldValidate: true, shouldDirty: true });
        markDirty();
    };

    const handleDescriptionChange = (value: string) => {
        setValue("description", value, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();
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