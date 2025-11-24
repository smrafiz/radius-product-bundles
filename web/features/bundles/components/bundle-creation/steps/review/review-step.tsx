"use client";

import { BundleSummary, useBundleFormMethods } from "@/features/bundles";

export function ReviewStep() {
    const { formState } = useBundleFormMethods();

    const errors = formState?.errors || {};
    const isValid = formState?.isValid ?? false;

    const formErrors = Object.entries(errors).map(([field, error]) => ({
        field,
        message: error?.message || "Invalid value",
    }));

    const hasErrors = formErrors.length > 0;

    return (
        <s-stack gap="base">
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

            <BundleSummary />
        </s-stack>
    );
}
