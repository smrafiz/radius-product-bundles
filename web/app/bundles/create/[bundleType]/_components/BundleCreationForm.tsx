'use client';

import React from 'react';
import NProgress from "nprogress";
import type { BundleType } from '@/types';
import { useRouter } from 'next/navigation';
import BundlePreview from './BundlePreview';
import { useBundleStore } from "@/lib/stores/bundleStore";
import {
    Page,
    Layout,
    Card,
    InlineStack,
    BlockStack,
    Text,
    Box,
    Button,
    Icon
} from '@shopify/polaris';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@shopify/polaris-icons';
import ReviewStep from "@/app/bundles/create/[bundleType]/_components/steps/ReviewStep";
import DisplayStep from "@/app/bundles/create/[bundleType]/_components/steps/DisplayStep";
import ConfigurationStep from "@/app/bundles/create/[bundleType]/_components/steps/ConfigurationStep";
import ProductsStep from "@/app/bundles/create/[bundleType]/_components/steps/ProductsStep";

interface Props {
    bundleType: BundleType;
}

const steps = [
    { id: 1, title: 'Select products', subtitle: 'Products in the offer' },
    { id: 2, title: 'Discount', subtitle: 'Discount type & amount' },
    { id: 3, title: 'Widgets', subtitle: 'Visual style & layout' },
    { id: 4, title: 'Review', subtitle: 'Offer summary & publish' },
];

export default function BundleCreationForm({ bundleType }: Props) {
    const router = useRouter();
    const { currentStep, setStep, nextStep, prevStep, bundleData, setBundleData } = useBundleStore();

    React.useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
        }
    }, [bundleType, bundleData, setBundleData]);

    const handleBack = () => {
        if (currentStep === 1) {
            NProgress.start();
            router.push('/bundles/create');
        } else {
            prevStep();
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            nextStep();
        }
    };

    const getBundleTypeTitle = (type: BundleType): string => {
        const titleMap: Record<BundleType, string> = {
            BUY_X_GET_Y: 'Buy X Get Y',
            BOGO: 'BOGO',
            VOLUME_DISCOUNT: 'Volume Discount',
            MIX_MATCH: 'Mix & Match',
            CROSS_SELL: 'Frequently Bought Together',
            FIXED_BUNDLE: "Fixed Bundle",
        };
        return titleMap[type] || type;
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <ProductsStep />;
            case 2:
                return <ConfigurationStep />;
            case 3:
                return <DisplayStep />;
            case 4:
                return <ReviewStep />;
            default:
                return <ProductsStep />;
        }
    };

    const getCurrentStepTitle = () => {
        return steps[currentStep - 1]?.title || 'Step';
    };

    const getPrevStepTitle = () => {
        if (currentStep === 1) return 'Bundle types';
        return steps[currentStep - 2]?.title || 'Previous';
    };

    const getNextStepTitle = () => {
        if (currentStep === steps.length) return 'Create bundle';
        return steps[currentStep]?.title || 'Next';
    };

    return (
        <Page
            title={`Create ${getBundleTypeTitle(bundleType)}`}
            subtitle="Configure your bundle settings and preview the customer experience"
        >
            <Layout>
                {/* Horizontal Step Navigation */}
                <Layout.Section>
                    <Card>
                        <InlineStack align="space-between" gap="400">
                            {steps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    {/* Step Item */}
                                    <InlineStack
                                        gap="300"
                                        blockAlign="center"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setStep(step.id)}
                                    >
                                        {/* Step Circle */}
                                        <Box
                                            background={
                                                currentStep > step.id
                                                    ? 'bg-fill-success'
                                                    : currentStep === step.id
                                                        ? 'bg-fill-brand'
                                                        : 'bg-surface-secondary'
                                            }
                                            borderRadius="full"
                                            padding="300"
                                            minWidth="40px"
                                            minHeight="40px"
                                        >
                                            <InlineStack align="center">
                                                {currentStep > step.id ? (
                                                    <Icon source={CheckIcon} tone="text-inverse" />
                                                ) : (
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="medium"
                                                        tone={currentStep >= step.id ? 'text-inverse' : 'subdued'}
                                                        as="span"
                                                    >
                                                        {String(step.id).padStart(2, '0')}
                                                    </Text>
                                                )}
                                            </InlineStack>
                                        </Box>

                                        {/* Step Content */}
                                        <BlockStack gap="050">
                                            <Text
                                                as="p"
                                                variant="bodyMd"
                                                fontWeight={currentStep === step.id ? "medium" : "regular"}
                                                tone={currentStep === step.id ? "base" : "subdued"}
                                            >
                                                {step.title}
                                            </Text>
                                            <Text variant="caption" tone="subdued">
                                                {step.subtitle}
                                            </Text>
                                        </BlockStack>
                                    </InlineStack>

                                    {/* Progress Line */}
                                    {index < steps.length - 1 && (
                                        <Box
                                            background={currentStep > step.id ? 'bg-fill-success' : 'bg-surface-secondary'}
                                            minHeight="3px"
                                            style={{
                                                flex: 1,
                                                maxWidth: '120px',
                                                minWidth: '60px'
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </InlineStack>
                    </Card>
                </Layout.Section>

                {/* Navigation Buttons */}
                <Layout.Section>
                    <InlineStack align="space-between">
                        {/* Previous Button */}
                        <Button
                            variant="secondary"
                            icon={ChevronLeftIcon}
                            onClick={handleBack}
                        >
                            {getPrevStepTitle()}
                        </Button>

                        {/* Current Step Indicator */}
                        <Box
                            background="bg-surface-secondary"
                            padding="200"
                            borderRadius="100"
                        >
                            <Text as="p" variant="bodySm" tone="subdued">
                                Step {currentStep} of {steps.length}: {getCurrentStepTitle()}
                            </Text>
                        </Box>

                        {/* Next Button */}
                        <Button
                            variant="primary"
                            iconAlignment="end"
                            icon={currentStep === steps.length ? undefined : ChevronRightIcon}
                            onClick={handleNext}
                        >
                            {getNextStepTitle()}
                        </Button>
                    </InlineStack>
                </Layout.Section>

                {/* Main Content Section */}
                <Layout.Section>
                    <Layout>
                        {/* Left Side - Form Steps */}
                        <Layout.Section variant="oneHalf">
                            <Card>
                                {renderCurrentStep()}
                            </Card>
                        </Layout.Section>

                        {/* Right Side - Preview */}
                        <Layout.Section variant="oneHalf">
                            <BundlePreview bundleData={bundleData} bundleType={bundleType} />
                        </Layout.Section>
                    </Layout>
                </Layout.Section>
            </Layout>
        </Page>
    );
}