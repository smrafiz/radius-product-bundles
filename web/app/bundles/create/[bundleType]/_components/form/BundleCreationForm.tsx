"use client";

import { useEffect, useState } from "react";
import { getBundleProperty, withLoader } from "@/utils";
import { Banner, Card, Layout, Page } from "@shopify/polaris";
import {
    StepContent,
    StepNavigation,
} from "@/bundles/create/[bundleType]/_components/form";
import { BundlePreview } from "@/bundles/create/[bundleType]/_components/preview";
import { HorizontalStepIndicator } from "@/bundles/create/[bundleType]/_components/shared";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

import type { BundleType } from "@/types";
import { useBundleStore } from "@/stores";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
    bundleType: BundleType;
    bundleName?: string;
}

export default function BundleCreationForm({ bundleType, bundleName }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { setStep } = useBundleStore();

    const { bundleData, setBundleData } = useBundleStore();
    const { setValue } = useBundleFormMethods();
    const [showSuccess, setShowSuccess] = useState(false);

    const isEditMode = pathname.includes("/edit");

    const handleBack = () => {
        if (isEditMode) {
            router.push("/bundles");
        } else {
            router.push("/bundles/create");
        }
    };

    useEffect(() => {
        const successParam = searchParams.get('success');

        if (successParam === 'created' || successParam === 'updated') {
            setShowSuccess(true);
            setStep(1);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('success');
                window.history.replaceState({}, '', url.toString());
                setShowSuccess(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [searchParams]);

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
                    onAction: withLoader(() => handleBack()),
                },
            };
        }

        return {
            title: `Create ${getBundleProperty(bundleType, "label")}`,
            subtitle:
                "Configure your bundle settings and preview the customer experience",
            backAction: {
                content: "Bundle Selection",
                onAction: withLoader(() => handleBack()),
            },
        };
    };

    const pageProps = getPageProps();

    // Determine banner content based on success parameter
    const getSuccessBanner = () => {
        const successParam = searchParams.get('success');

        if (successParam === 'created') {
            return {
                title: "Bundle created successfully!",
                content: "Your bundle has been created and is ready to go live."
            };
        }

        if (successParam === 'updated') {
            return {
                title: "Bundle updated successfully!",
                content: "Your bundle has been updated."
            };
        }

        return null;
    };

    const successBanner = getSuccessBanner();

    return (
        <Page {...pageProps}>
            <Layout>
                {/* Single success banner */}
                {showSuccess && successBanner && (
                    <Layout.Section>
                        <Banner
                            title={successBanner.title}
                            tone="success"
                            onDismiss={() => setShowSuccess(false)}
                        >
                            {successBanner.content}
                        </Banner>
                    </Layout.Section>
                )}

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