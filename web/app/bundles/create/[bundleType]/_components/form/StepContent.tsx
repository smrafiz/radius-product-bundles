"use client";

import { ReviewStep } from "@/bundles/create/[bundleType]/_components/steps/review";
import { DisplayStep } from "@/bundles/create/[bundleType]/_components/steps/display";
import { ProductsStep } from "@/bundles/create/[bundleType]/_components/steps/products";
import { ConfigurationStep } from "@/bundles/create/[bundleType]/_components/steps/configuration";

import { useBundleStore } from "@/stores";

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
