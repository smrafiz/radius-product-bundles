import {
    BUNDLE_STEPS,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";
import { useTranslations } from "@/lib/i18n/provider";

export function useStepIndicator() {
    const v = useTranslations("Validation");
    const { currentStep, setStep, setValidationAttempted } = useBundleStore(
        useShallow((s) => ({
            currentStep: s.currentStep,
            setStep: s.setStep,
            setValidationAttempted: s.setValidationAttempted,
        })),
    );
    const { validateCurrentStep } = useBundleValidation();

    const getStepStatus = (stepNumber: number) => {
        if (currentStep > stepNumber) return "completed";
        if (stepNumber === currentStep) return "current";
        return "upcoming";
    };

    const getStepColor = (status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "current":
                return "interactive";
            default:
                return "subdued";
        }
    };

    const getProgressLineColor = (stepNumber: number) => {
        return currentStep > stepNumber ? "success" : "subdued";
    };

    const canNavigateToStep = (_stepNumber: number) => {
        return true;
    };

    const navigateToStep = (stepNumber: number) => {
        setStep(stepNumber);
    };

    /**
     * Navigate to a step with validation when going forward.
     */
    const navigateToStepWithValidation = useCallback(
        async (stepNumber: number) => {
            if (stepNumber === currentStep) return;

            // Going backward — no validation needed
            if (stepNumber < currentStep) {
                setStep(stepNumber);
                return;
            }

            // Going forward — validate current step first
            setValidationAttempted(true);
            const isValid = await validateCurrentStep();

            if (!isValid) {
                if (typeof shopify !== "undefined" && shopify.toast?.show) {
                    shopify.toast.show(v("FILL_REQUIRED_FIELDS"), {
                        duration: 3000,
                        isError: true,
                    });
                }
                return;
            }

            setValidationAttempted(false);
            setStep(stepNumber);
        },
        [currentStep, setStep, setValidationAttempted, validateCurrentStep],
    );

    return {
        steps: BUNDLE_STEPS,
        currentStep,
        getStepStatus,
        getStepColor,
        getProgressLineColor,
        canNavigateToStep,
        navigateToStep,
        navigateToStepWithValidation,
    };
}
