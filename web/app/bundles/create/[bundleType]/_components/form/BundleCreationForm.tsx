"use client";

import { useEffect } from "react";
import { getBundleProperty, withLoader } from "@/utils";
import { Card, Layout, Page } from "@shopify/polaris";
import {
    StepContent,
    StepNavigation,
} from "@/bundles/create/[bundleType]/_components/form";
import { BundlePreview } from "@/bundles/create/[bundleType]/_components/preview";
import { HorizontalStepIndicator } from "@/bundles/create/[bundleType]/_components/shared";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

import type { BundleType } from "@/types";
import { useBundleStore } from "@/stores";
import { useRouter } from "next/navigation";

interface Props {
    bundleType: BundleType;
}

export default function BundleCreationForm({ bundleType }: Props) {
    const router = useRouter();
    const { bundleData, setBundleData } = useBundleStore();
    const { setValue } = useBundleFormMethods();

    const handleBack = () => {
        router.push("/bundles/create");
    };

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType);
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

    return (
        <Page
            title={`Create ${getBundleProperty(bundleType, "label")}`}
            subtitle="Configure your bundle settings and preview the customer experience"
            backAction={{
                content: "Bundle Selection",
                onAction: withLoader(() => handleBack()),
            }}
        >
            <Layout>
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
