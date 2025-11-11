"use client";

import {
    BundleCreationForm,
    BundleFormData,
    BundleFormProvider,
    BundleType,
    bundleTypeMap,
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

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm<BundleFormData>
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                discardPath="/bundles"
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}
