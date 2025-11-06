"use client";

import {
    DiscountStep,
    DisplayStep,
    ProductsStep,
    ReviewStep,
    useBundleStore,
} from "@/features/bundles";

export function StepContent() {
    const { currentStep } = useBundleStore();

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <ProductsStep />;
            case 2:
                return <DiscountStep />;
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
