import { useFormContext } from "react-hook-form";
import { BundleFormData } from "@/lib/validation";
import { useBundleStore } from "@/stores";
import { useBundleValidation } from "./useBundleValidation";
import { useCallback } from "react";

export function useBundleFormMethods() {
    const form = useFormContext<BundleFormData>();
    const { nextStep, setValidationAttempted, markDirty } = useBundleStore();
    const { validateCurrentStep, canProceedToNextStep, getFieldError } =
        useBundleValidation();

    if (!form) {
        throw new Error(
            "useBundleFormMethods must be used within BundleFormProvider",
        );
    }

    const { setValue: originalSetValue, formState, ...restForm } = form;

    // Wrap setValue to always mark dirty
    const setValue = useCallback(
        (name: any, value: any, options?: any) => {
            originalSetValue(name, value, { ...options, shouldDirty: true });
            markDirty();
        },
        [originalSetValue, markDirty],
    );

    const handleNextStep = useCallback(async () => {
        setValidationAttempted(true);

        const isValid = await validateCurrentStep();
        if (isValid) {
            nextStep();
            setValidationAttempted(false);
        }
    }, [validateCurrentStep, nextStep, setValidationAttempted]);

    return {
        ...restForm,
        formState, // Make sure formState is returned
        setValue,
        handleNextStep,
        canProceedToNextStep,
        getFieldError,
        validateCurrentStep,
        // Add safe access to errors
        errors: formState?.errors || {},
        isValid: formState?.isValid ?? false,
    };
}
