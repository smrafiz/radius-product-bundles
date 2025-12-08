"use client";

import {
    BUNDLE_STEP_FIELD_MAP,
    BundleCreationForm,
    BundleFormData,
    BundleFormProvider,
    BundleType,
    bundleTypeMap,
    useBundleStore,
    useBundleSubmit,
} from "@/features/bundles";
import { GlobalForm } from "@/shared";

export function CreateBundlePage({
    params,
}: {
    params: { bundleType: BundleType };
}) {
    const { bundleType: bundleTypeParam } = params;
    const bundleType = bundleTypeMap[bundleTypeParam] as BundleType;

    const { handleSubmit, resetDirty } = useBundleSubmit("create");
    const { setStep, setValidationAttempted } = useBundleStore();

    /**
     * Handles validation errors by navigating to the step with the error.
     */
    const handleValidationError = ({ step }: { step?: number }) => {
        if (step) {
            setStep(step);
            setValidationAttempted(true);
        }
    };

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm<BundleFormData>
                formId="bundle"
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                stepFieldMap={BUNDLE_STEP_FIELD_MAP}
                onValidationError={handleValidationError}
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}
