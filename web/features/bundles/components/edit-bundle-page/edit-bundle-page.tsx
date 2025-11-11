"use client";

import {
    BundleCreationForm,
    BundleFormProvider,
    useBundleSubmit,
    useEditBundle,
    useEditBundleTransform,
} from "@/features/bundles";
import { DashboardSkeleton, GlobalForm } from "@/shared";
import { Banner, Card, Page, Text } from "@shopify/polaris";

export function EditBundlePage({
    params,
}: {
    params: { id: string };
}) {
    const { id: bundleId } = params;
    const { bundleData, isLoading, isError, errorMessage } =
        useEditBundle(bundleId);

    const { handleSubmit, resetDirty } = useBundleSubmit("edit", bundleId);
    const initialData = useEditBundleTransform(bundleData);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError || !bundleData) {
        return (
            <Page title="Error">
                <Card>
                    <div className="p-5">
                        <Banner tone="critical" title="Error loading bundle">
                            <Text as="p" variant="bodyMd">
                                {errorMessage}
                            </Text>
                        </Banner>
                    </div>
                </Card>
            </Page>
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
                discardPath={`/bundles/${bundleId}`}
            >
                <BundleCreationForm
                    bundleType={bundleData.type}
                    bundleName={bundleData.name}
                />
            </GlobalForm>
        </BundleFormProvider>
    );
}
