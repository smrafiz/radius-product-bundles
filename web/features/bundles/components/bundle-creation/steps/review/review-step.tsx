"use client";

import {
    BundleSummary,
    BundleType,
    BxgyReviewSection,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";

const BXGY_TYPES: BundleType[] = ["BOGO", "BUY_X_GET_Y"];

export function ReviewStep() {
    const { formState } = useBundleFormMethods();
    const bundleType = useBundleStore((s) => s.bundleData.type);
    const isBxgy = BXGY_TYPES.includes(bundleType as BundleType);

    const errors = formState?.errors || {};
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

            {isBxgy ? <BxgyReviewSection /> : <BundleSummary />}
        </s-stack>
    );
}
