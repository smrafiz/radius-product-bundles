"use client";

import { useBundleStore } from "@/stores";
import {
    ConfigurationStep,
    DisplayStep,
    ProductsStep,
    ReviewStep,
} from "@/features/bundles";

export function StepContent() {
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
