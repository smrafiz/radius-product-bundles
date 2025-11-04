import { BUNDLE_STEPS, useBundleStore } from "@/features/bundles";

export function useStepIndicator() {
    const { currentStep, setStep } = useBundleStore();

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

    const canNavigateToStep = (stepNumber: number) => {
        // Allow navigation to completed steps and current step
        return stepNumber <= currentStep;
    };

    const navigateToStep = (stepNumber: number) => {
        if (canNavigateToStep(stepNumber)) {
            setStep(stepNumber);
        }
    };

    return {
        steps: BUNDLE_STEPS,
        currentStep,
        getStepStatus,
        getStepColor,
        getProgressLineColor,
        canNavigateToStep,
        navigateToStep,
    };
}
