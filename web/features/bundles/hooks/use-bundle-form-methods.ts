"use client";

import {
    BundleFormData,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

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
        formState,
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
