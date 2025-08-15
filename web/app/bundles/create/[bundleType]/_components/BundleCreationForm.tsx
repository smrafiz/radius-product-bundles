'use client';

import React from 'react';
import NProgress from "nprogress";
import type { BundleType } from '@/types';
import { useRouter } from 'next/navigation';
import BundlePreview from './BundlePreview';
import { useBundleStore } from "@/lib/stores/bundleStore";
import { Page, Layout, Card, ProgressBar } from '@shopify/polaris';
import ReviewStep from "@/app/bundles/create/[bundleType]/_components/steps/ReviewStep";
import WidgetsStep from "@/app/bundles/create/[bundleType]/_components/steps/WidgetsStep";
import DiscountStep from "@/app/bundles/create/[bundleType]/_components/steps/DiscountStep";
import SelectProductsStep from "@/app/bundles/create/[bundleType]/_components/steps/SelectProductsStep";

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

    // Initialize type only once
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

    const handleStepClick = (stepNumber: number) => {
        setStep(stepNumber);
    };

    const getBundleTypeTitle = (type: BundleType): string => {
        const titleMap: Record<BundleType, string> = {
            BUY_X_GET_Y: 'Buy X Get Y',
            BOGO: 'BOGO',
            VOLUME_DISCOUNT: 'Volume Discount',
            MIX_MATCH: 'Mix & Match',
            CROSS_SELL: 'Cross Sell',
            FIXED_BUNDLE: 'Fixed Bundle',
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
            backAction={{ content: currentStep === 1 ? 'Bundle types' : 'Previous step', onAction: handleBack }}
            primaryAction={{ content: currentStep === steps.length ? 'Create bundle' : 'Next step', onAction: handleNext }}
        >
            {/* Progress Steps */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className={`flex items-center cursor-pointer ${index < steps.length - 1 ? 'flex-1' : ''}`} onClick={() => handleStepClick(step.id)}>
                            <div className="flex items-center">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                        ${currentStep === step.id
                                        ? 'bg-blue-600 text-white'
                                        : currentStep > step.id
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-600'}
                                    `}
                                >
                                    {step.id}
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium">{step.title}</div>
                                    <div className="text-xs text-gray-500">{step.subtitle}</div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-px mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
                <ProgressBar progress={(currentStep / steps.length) * 100} />
            </div>

            <Layout>
                <Layout.Section variant="oneHalf">
                    <Card>{renderCurrentStep()}</Card>
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                    <BundlePreview bundleData={bundleData} bundleType={bundleType} />
                </Layout.Section>
            </Layout>
        </Page>
    );
}