"use client";

import {
    BundleCreationForm,
    BundleFormProvider,
    useBundleDataSync,
    useBundleSubmit,
    useEditBundle,
    useEditBundleTransform,
} from "@/features/bundles";
import { DashboardSkeleton, GlobalForm } from "@/shared";

export function EditBundlePage({ params }: { params: { id: string } }) {
    const { id: bundleId } = params;
    const { bundleData, isLoading, isError, errorMessage } =
        useEditBundle(bundleId);

    const { handleSubmit, resetDirty } = useBundleSubmit("edit", bundleId);
    const initialData = useEditBundleTransform(bundleData);
    useBundleDataSync(bundleData);

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
            <GlobalForm
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                discardPath={`/bundles/${bundleId}/edit`}
            >
                <BundleCreationForm
                    bundleType={bundleData.type}
                    bundleName={bundleData.name}
                />
            </GlobalForm>
        </BundleFormProvider>
    );
}
