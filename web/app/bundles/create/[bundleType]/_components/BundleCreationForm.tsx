'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page, Layout, Card, ProgressBar, Button } from '@shopify/polaris';
import type { BundleType, CreateBundlePayload } from '@/types';

// Step Components (to be created)
import SelectProductsStep from './steps/SelectProductsStep';
import DiscountStep from './steps/DiscountStep';
import WidgetsStep from './steps/WidgetsStep';
import ReviewStep from './steps/ReviewStep';

// Preview Component (to be created)
import BundlePreview from './BundlePreview';

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
    const [currentStep, setCurrentStep] = useState(1);
    const [bundleData, setBundleData] = useState<Partial<CreateBundlePayload>>({
        type: bundleType,
        name: '',
        products: [],
        discountType: undefined,
        discountValue: 0,
        description: '',
        minOrderValue: undefined,
        maxDiscountAmount: undefined,
        startDate: undefined,
        endDate: undefined,
    });

    const handleBack = () => {
        if (currentStep === 1) {
            router.push('/bundles/create');
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (stepNumber: number) => {
        setCurrentStep(stepNumber);
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
                return <SelectProductsStep bundleData={bundleData} setBundleData={setBundleData} />;
            case 2:
                return <DiscountStep bundleData={bundleData} setBundleData={setBundleData} />;
            case 3:
                return <WidgetsStep bundleData={bundleData} setBundleData={setBundleData} />;
            case 4:
                return <ReviewStep bundleData={bundleData} setBundleData={setBundleData} />;
            default:
                return <SelectProductsStep bundleData={bundleData} setBundleData={setBundleData} />;
        }
    };

    return (
        <Page
            title={`Create ${getBundleTypeTitle(bundleType)}`}
            subtitle="Configure your bundle settings and preview the customer experience"
            backAction={{
                content: currentStep === 1 ? 'Bundle types' : 'Previous step',
                onAction: handleBack,
            }}
            primaryAction={{
                content: currentStep === steps.length ? 'Create bundle' : 'Next step',
                onAction: handleNext,
            }}
        >
            {/* Progress Steps */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex items-center cursor-pointer ${
                                index < steps.length - 1 ? 'flex-1' : ''
                            }`}
                            onClick={() => handleStepClick(step.id)}
                        >
                            <div className="flex items-center">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                        ${currentStep === step.id
                                        ? 'bg-blue-600 text-white'
                                        : currentStep > step.id
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }
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
                                <div className={`flex-1 h-px mx-4 ${
                                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
                <ProgressBar progress={(currentStep / steps.length) * 100} />
            </div>

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
        </Page>
    );
}