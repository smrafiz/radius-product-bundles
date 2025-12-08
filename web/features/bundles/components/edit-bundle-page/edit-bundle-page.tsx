"use client";

import {
    BundleCreationForm,
    BundleFormData,
    BundleFormProvider,
    useBundleDataSync,
    useBundleSubmit,
    useBundleStore,
    useEditBundle,
    useEditBundleTransform,
    BUNDLE_STEP_FIELD_MAP,
} from "@/features/bundles";
import { DashboardSkeleton, GlobalForm } from "@/shared";

export function EditBundlePage({ params }: { params: { id: string } }) {
    const { id: bundleId } = params;
    const { bundleData, isLoading, isError, errorMessage } =
        useEditBundle(bundleId);

    const { handleSubmit, resetDirty } = useBundleSubmit("edit", bundleId);
    const { setStep, setValidationAttempted } = useBundleStore();
    const initialData = useEditBundleTransform(bundleData);
    useBundleDataSync(bundleData);

    /**
     * Handles validation errors by navigating to the step with the error.
     */
    const handleValidationError = ({ step }: { step?: number }) => {
        if (step) {
            setStep(step);
            setValidationAttempted(true);
        }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError || !bundleData) {
        return (
            <s-page heading="Error">
                <s-stack paddingBlockStart="large" paddingBlockEnd="large">
                    <s-banner tone="critical" heading="Error loading bundle">
                        {errorMessage}
                    </s-banner>
                </s-stack>
            </s-page>
        );
    }

    return (
        <BundleFormProvider
            bundleType={bundleData.type}
            initialData={initialData}
        >
            <GlobalForm<BundleFormData>
                formId="bundle"
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                stepFieldMap={BUNDLE_STEP_FIELD_MAP}
                onValidationError={handleValidationError}
            >
                <BundleCreationForm
                    bundleType={bundleData.type}
                    bundleName={bundleData.name}
                />
            </GlobalForm>
        </BundleFormProvider>
    );
}