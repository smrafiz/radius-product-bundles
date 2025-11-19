"use client";

import {
    DiscountStep,
    AppearanceStep,
    ProductsStep,
    ReviewStep,
    useBundleStore,
    BundleType,
} from "@/features/bundles";

export function StepContent({ bundleType }: { bundleType: BundleType }) {
    const { currentStep } = useBundleStore();

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <ProductsStep bundleType={bundleType} />;
            case 2:
                return <DiscountStep />;
            case 3:
                return <AppearanceStep />;
            case 4:
                return <ReviewStep />;
            default:
                return <ProductsStep bundleType={bundleType} />;
        }
    };

    return renderCurrentStep();
}
