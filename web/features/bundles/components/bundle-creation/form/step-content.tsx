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
import { useMemo } from "react";

function useReducedMotion(): boolean {
    return useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
}

export function StepContent({ bundleType }: { bundleType: BundleType }) {
    const { currentStep, previousStep } = useBundleStore(
        useShallow((s) => ({ currentStep: s.currentStep, previousStep: s.previousStep })),
    );

    const reducedMotion = useReducedMotion();
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
            style={reducedMotion ? undefined : { animation: `${animName} 0.22s ease-out` }}
        >
            {renderCurrentStep()}
        </div>
    );
}
