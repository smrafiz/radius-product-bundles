// web/hooks/bundle/useBundleFormMethods.ts
import { useFormContext } from "react-hook-form";
import { BundleFormData } from "@/lib/validation";
import { useBundleStore } from "@/stores";
import { useCallback } from "react";

/**
 * Hook to use bundle form methods when inside FormProvider context
 * Works with your GlobalForm architecture
 */
export function useBundleFormMethods() {
    const methods = useFormContext<BundleFormData>();

    if (!methods) {
        throw new Error(
            "useBundleFormMethods must be used within BundleFormProvider",
        );
    }

    const { currentStep, selectedItems, nextStep, setValidationAttempted } =
        useBundleStore();

    const {
        setValue,
        watch,
        formState: { errors, isValid },
        trigger,
    } = methods;

    // Step validation function
    const validateCurrentStep = useCallback(async () => {
        setValidationAttempted(true);

        let fieldsToValidate: (keyof BundleFormData)[] = [];

        switch (currentStep) {
            case 1: // Products step
                fieldsToValidate = ["products"];
                break;
            case 2: // Configuration step
                fieldsToValidate = ["name", "discountType", "discountValue"];
                break;
            case 3: // Display step
                return true;
            case 4: // Review step
                return await trigger();
        }

        const isStepValid = await trigger(fieldsToValidate);
        return isStepValid;
    }, [currentStep, trigger, setValidationAttempted]);

    // Handle next step with validation
    const handleNextStep = useCallback(async () => {
        const isStepValid = await validateCurrentStep();
        if (isStepValid) {
            nextStep();
        }
    }, [validateCurrentStep, nextStep]);

    // Get field error
    const getFieldError = useCallback(
        (fieldName: string) => {
            const error = errors[fieldName as keyof BundleFormData];
            return error?.message;
        },
        [errors],
    );

    // Check if can proceed to next step
    const canProceedToNextStep = useCallback(() => {
        switch (currentStep) {
            case 1: // Products step
                return selectedItems.length > 0;
            case 2: // Configuration step
                return (
                    !errors.name &&
                    !errors.discountType &&
                    !errors.discountValue
                );
            case 3: // Display step
                return true;
            case 4: // Review step
                return isValid;
            default:
                return false;
        }
    }, [currentStep, selectedItems.length, errors, isValid]);

    return {
        // Form methods from context
        ...methods,

        // Custom methods
        handleNextStep,
        validateCurrentStep,
        getFieldError,
        canProceedToNextStep,

        // Validation state
        isValid,
        errors,
    };
}
