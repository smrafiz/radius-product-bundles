import { useBundleStore } from '@/stores';
import { useBundleValidation } from '@/hooks';

export function useStepNavigation() {
    const {
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        setStep,
        canGoNext,
        canGoPrevious
    } = useBundleStore();

    const { canProceedToNextStep } = useBundleValidation();

    const goToNextStep = () => {
        if (canProceedToNextStep() && canGoNext()) {
            nextStep();
        }
    };

    const goToPreviousStep = () => {
        if (canGoPrevious()) {
            prevStep();
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setStep(step);
        }
    };

    const isCurrentStep = (step: number) => {
        return currentStep === step;
    };

    const isStepCompleted = (step: number) => {
        return currentStep > step;
    };

    const canNavigateToStep = (step: number) => {
        // Can always go back to previous steps
        if (step < currentStep) return true;

        // Can only go forward if current step is valid
        if (step === currentStep + 1) {
            return canProceedToNextStep() && canGoNext();
        }

        // Can't jump forward more than one step
        return false;
    };

    return {
        currentStep,
        totalSteps,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        isCurrentStep,
        isStepCompleted,
        canNavigateToStep,
        canGoNext: canGoNext() && canProceedToNextStep(),
        canGoPrevious: canGoPrevious(),
    };
}