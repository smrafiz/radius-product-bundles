"use client";

import React from 'react';
import { useBundleStore } from "@/stores";
import ProductsStep from '../steps/products';
import ConfigurationStep from "@/app/bundles/create/[bundleType]/_components/steps/configuration/ConfigurationStep";
import DisplayStep from "@/app/bundles/create/[bundleType]/_components/steps/display/DisplayStep";
import ReviewStep from "@/app/bundles/create/[bundleType]/_components/steps/review/ReviewStep";

export default function StepContent() {
    const { currentStep } = useBundleStore();

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

    return renderCurrentStep();
}