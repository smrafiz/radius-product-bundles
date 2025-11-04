"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    StepContent,
    StepNavigation,
    useBundleFormManager,
} from "@/features/bundles";
import { GlobalBanner } from "@/shared";
import { Card, Layout, Page } from "@shopify/polaris";

/**
 * Bundle creation form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
}: BundleCreationFormProps) {
    const { pageProps } = useBundleFormManager({
        bundleType,
        bundleName,
    });

    return (
        <Page {...pageProps}>
            <Layout>
                {/* Success banner */}
                <GlobalBanner />

                {/* Horizontal Step Navigation */}
                <Layout.Section>
                    <HorizontalStepIndicator />
                </Layout.Section>

                {/* Navigation Buttons */}
                <Layout.Section>
                    <StepNavigation />
                </Layout.Section>

                {/* Main Content Section */}
                <Layout.Section>
                    <div className="pb-6">
                        <Layout>
                            <Layout.Section>
                                <Card>
                                    <StepContent />
                                </Card>
                            </Layout.Section>

                            <Layout.Section variant="oneThird">
                                <BundlePreview bundleType={bundleType} />
                            </Layout.Section>
                        </Layout>
                    </div>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
