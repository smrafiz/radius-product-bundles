"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    getBundleProperty,
    HorizontalStepIndicator,
    StepContent,
    StepNavigation,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, Layout, Page } from "@shopify/polaris";
import { GlobalBanner, useAppNavigation } from "@/shared";

export function BundleCreationForm({
    bundleType,
    bundleName,
}: BundleCreationFormProps) {
    const { goBack } = useAppNavigation();
    const { bundleData, setBundleData } = useBundleStore();
    const { setValue } = useBundleFormMethods();

    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType);
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

    const getPageProps = () => {
        if (isEditMode) {
            return {
                title: `Edit ${bundleName || getBundleProperty(bundleType, "label")}`,
                subtitle: "Update your bundle settings and preview changes",
                backAction: {
                    content: "Back to Bundles",
                    onAction: goBack,
                },
            };
        }

        return {
            title: `Create ${getBundleProperty(bundleType, "label")}`,
            subtitle:
                "Configure your bundle settings and preview the customer experience",
            backAction: {
                content: "Bundle Selection",
                onAction: goBack,
            },
        };
    };

    const pageProps = getPageProps();

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
