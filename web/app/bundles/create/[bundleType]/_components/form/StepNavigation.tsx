// web/app/bundles/create/[bundleType]/_components/form/StepNavigation.tsx
"use client";

import { InlineStack, Button } from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

export default function StepNavigation() {
    const {
        currentStep,
        totalSteps,
        prevStep,
        canGoPrevious,
    } = useBundleStore();

    const {
        handleNextStep,
        canProceedToNextStep,
    } = useBundleFormMethods();

    const isLastStep = currentStep === totalSteps;
    const canGoNext = canProceedToNextStep();
    const canGoPrev = canGoPrevious();

    const getNextButtonText = () => {
        switch (currentStep) {
            case 1:
                return "Continue to Configuration";
            case 2:
                return "Continue to Display";
            case 3:
                return "Continue to Review";
            case 4:
                return "Review Complete";
            default:
                return "Continue";
        }
    };

    const getPrevButtonText = () => {
        switch (currentStep) {
            case 2:
                return "Back to Products";
            case 3:
                return "Back to Configuration";
            case 4:
                return "Back to Display";
            default:
                return "Back";
        }
    };

    return (
        <InlineStack align="space-between">
            <Button
                onClick={prevStep}
                disabled={!canGoPrev}
                variant="secondary"
            >
                {getPrevButtonText()}
            </Button>

            {!isLastStep && (
                <Button
                    onClick={handleNextStep}
                    disabled={!canGoNext}
                    variant="primary"
                >
                    {getNextButtonText()}
                </Button>
            )}

            {isLastStep && (
                <Button
                    variant="primary"
                    disabled={!canGoNext}
                >
                    Ready to Create
                </Button>
            )}
        </InlineStack>
    );
}