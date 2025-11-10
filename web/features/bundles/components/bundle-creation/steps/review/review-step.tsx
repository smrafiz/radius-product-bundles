"use client";

import {
    BundleSummary,
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
        <s-stack gap="base">
            {/* Show validation errors */}
            {hasErrors && (
                <s-banner
                    heading="Please fix the following errors:"
                    tone="critical"
                    dismissible
                >
                    <s-unordered-list>
                        {formErrors.map(({ field, message }, index) => (
                            <s-list-item key={index}>
                                {field}: {message}
                            </s-list-item>
                        ))}
                    </s-unordered-list>
                </s-banner>
            )}

            {/* Bundle Summary */}
            <BundleSummary />
        </s-stack>
    );
}
