// web/app/bundles/create/[bundleType]/_components/steps/review/ReviewStep.tsx
"use client";

import React from "react";
import { BlockStack, Card, Text, Banner, List } from "@shopify/polaris";
import { StepHeading } from "@/bundles/create/[bundleType]/_components/shared";
import { BundleSummary } from "@/bundles/create/[bundleType]/_components/steps/review";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

export default function ReviewStep() {
    const { errors, isValid, createError } = useBundleFormMethods();

    // Get all form errors
    const formErrors = Object.entries(errors).map(([field, error]) => ({
        field,
        message: error?.message || "Invalid value"
    }));

    const hasErrors = formErrors.length > 0;

    // Parse server error if exists
    const serverError = createError ? (() => {
        try {
            const errorData = JSON.parse(createError.message);
            return errorData;
        } catch {
            return { error: createError.message };
        }
    })() : null;

    return (
        <BlockStack gap="500">
            <StepHeading
                title="Review & Create"
                description="Review your bundle configuration and create it"
            />

            {/* Show validation errors */}
            {hasErrors && (
                <Banner tone="critical" title="Please fix the following errors:">
                    <List type="bullet">
                        {formErrors.map(({ field, message }, index) => (
                            <List.Item key={index}>
                                <strong>{field}:</strong> {message}
                            </List.Item>
                        ))}
                    </List>
                </Banner>
            )}

            {/* Show server errors */}
            {serverError && (
                <Banner tone="critical" title="Failed to create bundle">
                    {serverError.details ? (
                        <List type="bullet">
                            {serverError.details.map((detail: { field: string; message: string }, index: number) => (
                                <List.Item key={index}>
                                    <strong>{detail.field}:</strong> {detail.message}
                                </List.Item>
                            ))}
                        </List>
                    ) : (
                        <Text as="p">{serverError.error || "An unexpected error occurred"}</Text>
                    )}
                </Banner>
            )}

            {/* Show success message when valid */}
            {isValid && !hasErrors && (
                <Banner tone="success" title="Bundle is ready to create">
                    All required fields are filled and validation passed. Click "Create Bundle" to save your bundle.
                </Banner>
            )}

            {/* Bundle Summary */}
            <BundleSummary />
        </BlockStack>
    );
}