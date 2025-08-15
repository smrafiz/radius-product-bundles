"use client";

import React from "react";
import NProgress from "nprogress";
import type { BundleType } from "@/types";
import { useRouter } from "next/navigation";
import BundlePreview from "./BundlePreview";
import { useBundleStore } from "@/lib/stores/bundleStore";
import {
    BlockStack,
    Box,
    Card,
    InlineStack,
    Layout,
    Page,
    ProgressBar,
    Text,
} from "@shopify/polaris";
import ReviewStep from "@/app/bundles/create/[bundleType]/_components/steps/ReviewStep";
import WidgetsStep from "@/app/bundles/create/[bundleType]/_components/steps/WidgetsStep";
import DiscountStep from "@/app/bundles/create/[bundleType]/_components/steps/DiscountStep";
import SelectProductsStep from "@/app/bundles/create/[bundleType]/_components/steps/SelectProductsStep";

interface Props {
    bundleType: BundleType;
}

const steps = [
    { id: 1, title: "Select products", subtitle: "Products in the offer" },
    { id: 2, title: "Discount", subtitle: "Discount type & amount" },
    { id: 3, title: "Widgets", subtitle: "Visual style & layout" },
    { id: 4, title: "Review", subtitle: "Offer summary & publish" },
];

export default function BundleCreationForm({ bundleType }: Props) {
    const router = useRouter();
    const {
        currentStep,
        setStep,
        nextStep,
        prevStep,
        bundleData,
        setBundleData,
    } = useBundleStore();

    React.useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
        }
    }, [bundleType, bundleData, setBundleData]);

    const handleBack = () => {
        if (currentStep === 1) {
            NProgress.start();
            router.push("/bundles/create");
        } else {
            prevStep();
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            nextStep();
        }
    };

    const handleStepClick = (stepNumber: number) => {
        setStep(stepNumber);
    };

    const getBundleTypeTitle = (type: BundleType): string => {
        const titleMap: Record<BundleType, string> = {
            BUY_X_GET_Y: "Buy X Get Y",
            BOGO: "BOGO",
            VOLUME_DISCOUNT: "Volume Discount",
            MIX_MATCH: "Mix & Match",
            CROSS_SELL: "Frequently Bought Together",
            FIXED_BUNDLE: "Fixed Bundle",
        };
        return titleMap[type] || type;
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <SelectProductsStep />;
            case 2:
                return <DiscountStep />;
            case 3:
                return <WidgetsStep />;
            case 4:
                return <ReviewStep />;
            default:
                return <SelectProductsStep />;
        }
    };

    return (
        <Page
            title={`Create ${getBundleTypeTitle(bundleType)}`}
            subtitle="Configure your bundle settings and preview the customer experience"
            backAction={{
                content: currentStep === 1 ? "Bundle types" : "Previous step",
                onAction: handleBack,
            }}
            primaryAction={{
                content:
                    currentStep === steps.length
                        ? "Create bundle"
                        : "Next step",
                onAction: handleNext,
            }}
        >
            <Layout>
                {/* Progress Steps Section */}
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            {/* Step Navigation */}
                            <BlockStack gap="300">
                                {steps.map((step) => (
                                    <InlineStack
                                        key={step.id}
                                        gap="300"
                                        blockAlign="center"
                                    >
                                        {/* Step Circle */}
                                        <Box
                                            background={
                                                currentStep === step.id
                                                    ? "bg-fill-brand"
                                                    : currentStep > step.id
                                                      ? "bg-fill-success"
                                                      : "bg-surface-secondary"
                                            }
                                            borderRadius="full"
                                            padding="200"
                                            minWidth="32px"
                                            minHeight="32px"
                                        >
                                            <InlineStack align="center">
                                                <Text
                                                    variant="bodySm"
                                                    fontWeight="medium"
                                                    tone={
                                                        currentStep >= step.id
                                                            ? "text-inverse"
                                                            : "subdued"
                                                    }
                                                    as="span"
                                                >
                                                    {step.id}
                                                </Text>
                                            </InlineStack>
                                        </Box>

                                        {/* Step Content */}
                                        <BlockStack gap="050">
                                            <Text
                                                as="span"
                                                variant="bodySm"
                                                fontWeight={
                                                    currentStep === step.id
                                                        ? "medium"
                                                        : "regular"
                                                }
                                                tone={
                                                    currentStep === step.id
                                                        ? "base"
                                                        : "subdued"
                                                }
                                            >
                                                {step.title}
                                            </Text>
                                            <Text as="span" variant="bodyXs" tone="subdued">
                                                {step.subtitle}
                                            </Text>
                                        </BlockStack>
                                    </InlineStack>
                                ))}
                            </BlockStack>

                            {/* Progress Bar */}
                            <ProgressBar
                                progress={(currentStep / steps.length) * 100}
                            />
                        </BlockStack>
                    </Card>
                </Layout.Section>

                {/* Main Content Section */}
                <Layout.Section>
                    <Layout>
                        {/* Left Side - Form Steps */}
                        <Layout.Section variant="oneHalf">
                            <Card>{renderCurrentStep()}</Card>
                        </Layout.Section>

                        {/* Right Side - Preview */}
                        <Layout.Section variant="oneHalf">
                            <BundlePreview
                                bundleData={bundleData}
                                bundleType={bundleType}
                            />
                        </Layout.Section>
                    </Layout>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
