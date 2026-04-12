"use client";

import {
    AppearanceStep,
    BundleType,
    DiscountStep,
    ProductsStep,
    ReviewStep,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";

export function StepContent({ bundleType }: { bundleType: BundleType }) {
    const { currentStep, previousStep } = useBundleStore(
        useShallow((s) => ({ currentStep: s.currentStep, previousStep: s.previousStep })),
    );

    const direction = currentStep > previousStep ? 1 : -1;
    const animName = direction > 0 ? "rpbStepSlideLeft" : "rpbStepSlideRight";

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

    return (
        <div
            key={currentStep}
            style={{ animation: `${animName} 0.22s ease-out` }}
        >
            {renderCurrentStep()}
        </div>
    );
}
