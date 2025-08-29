"use client";

import React from "react";
import type { BundleType } from "@/types";
import { useBundleStore } from "@/stores";
import { Card, Layout, Page } from "@shopify/polaris";
import { HorizontalStepIndicator } from "@/app/bundles/create/[bundleType]/_components/shared";
import {
    StepContent,
    StepNavigation,
} from "@/app/bundles/create/[bundleType]/_components/form/index";
import BundlePreview from "@/app/bundles/create/[bundleType]/_components/preview";
import { bundleTypeConfigs } from "@/config";

interface Props {
    bundleType: BundleType;
}

export default function BundleCreationForm({ bundleType }: Props) {
    const { bundleData, setBundleData } = useBundleStore();

    React.useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
        }
    }, [bundleType, bundleData, setBundleData]);

    const getBundleTypeTitle = (type: BundleType): string => {
        return bundleTypeConfigs[type]?.title ?? type;
    };

    return (
        <Page
            title={`Create ${getBundleTypeTitle(bundleType)}`}
            subtitle="Configure your bundle settings and preview the customer experience"
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
