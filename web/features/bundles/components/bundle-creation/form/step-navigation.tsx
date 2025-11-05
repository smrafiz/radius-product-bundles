"use client";

import {
    BundleFormData,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { usePathname } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button, InlineStack } from "@shopify/polaris";

export function StepNavigation() {
    const { currentStep, totalSteps, prevStep, canGoPrevious } =
        useBundleStore();
    const { handleNextStep } = useBundleFormMethods();
    const { handleSubmit, getValues } = useFormContext<BundleFormData>();
    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");

    const isLastStep = currentStep === totalSteps;
    const canGoPrev = canGoPrevious();

    // Handle form submission for the last step
    const onSubmit = (data: BundleFormData) => {
        console.log("=== FORM SUBMISSION DATA ===");
        console.log("Form Data:", data);
        console.log("Form Values (getValues):", getValues());
        console.log("==========================");

        // Trigger the GlobalForm submit by dispatching a form submit event
        const form = document.querySelector(
            'form[data-save-bar="true"]',
        ) as HTMLFormElement;
        if (form) {
            form.requestSubmit();
        }
    };

    const onError = (errors: any) => {
        console.log("=== FORM VALIDATION ERRORS ===");
        console.log("Errors:", errors);
        console.log("==============================");
    };

    const handleFinalSubmit = () => {
        handleSubmit(onSubmit, onError)();
    };

    const getNextButtonText = () => {
        switch (currentStep) {
            case 1:
            case 2:
            case 3:
                return "Continue";
            case 4:
                return isEditMode ? "Update" : "Create";
            default:
                return "Continue";
        }
    };

    const getPrevButtonText = () => "Back";

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
                    variant="primary"
                    // Remove disabled state - let validation happen on click
                >
                    {getNextButtonText()}
                </Button>
            )}

            {isLastStep && (
                <Button
                    onClick={handleFinalSubmit}
                    variant="primary"
                    // Remove disabled state - let validation happen on click
                >
                    {getNextButtonText()}
                </Button>
            )}
        </InlineStack>
    );
}
