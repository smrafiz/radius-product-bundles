"use client";

import {
    BundleSummary,
    StepHeading,
    useBundleFormMethods,
} from "@/features/bundles";
import { Banner, BlockStack, List } from "@shopify/polaris";

export function ReviewStep() {
    const { formState } = useBundleFormMethods();

    // Safely handle errors - they might be undefined
    const errors = formState?.errors || {};
    const isValid = formState?.isValid ?? false;

    // Get all form errors safely
    const formErrors = Object.entries(errors).map(([field, error]) => ({
        field,
        message: error?.message || "Invalid value",
    }));

    const hasErrors = formErrors.length > 0;

    return (
        <BlockStack gap="500">
            <StepHeading
                title="Review & Create"
                description="Review your bundle configuration and create it"
            />

            {/* Show validation errors */}
            {hasErrors && (
                <Banner
                    tone="critical"
                    title="Please fix the following errors:"
                >
                    <List type="bullet">
                        {formErrors.map(({ field, message }, index) => (
                            <List.Item key={index}>
                                <strong>{field}:</strong> {message}
                            </List.Item>
                        ))}
                    </List>
                </Banner>
            )}

            {/* Show success message when valid */}
            {isValid && !hasErrors && (
                <Banner tone="success" title="Bundle is ready to create">
                    All required fields are filled and validation passed. Click
                    "Create Bundle" to save your bundle.
                </Banner>
            )}

            {/* Bundle Summary */}
            <BundleSummary />
        </BlockStack>
    );
}
