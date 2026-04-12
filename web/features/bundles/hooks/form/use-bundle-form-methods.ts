"use client";

import {
    BundleFormData,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "@/lib/i18n/provider";

export function useBundleFormMethods() {
    const v = useTranslations("Validation");
    const form = useFormContext<BundleFormData>();
    const { nextStep, setValidationAttempted, markDirty } = useBundleStore(
        useShallow((s) => ({
            nextStep: s.nextStep,
            setValidationAttempted: s.setValidationAttempted,
            markDirty: s.markDirty,
        })),
    );
    const { validateCurrentStep, canProceedToNextStep, getFieldError } =
        useBundleValidation();

    if (!form) {
        throw new Error(
            "useBundleFormMethods must be used within BundleFormProvider",
        );
    }

    const { setValue: originalSetValue, formState, ...restForm } = form;

    const setValue = useCallback(
        (name: any, value: any, options?: any) => {
            const shouldDirty = options?.shouldDirty !== false;
            originalSetValue(name, value, { ...options, shouldDirty });

            if (shouldDirty) {
                markDirty();
            }
        },
        [originalSetValue, markDirty],
    );

    const handleNextStep = useCallback(async () => {
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

        nextStep();
        setValidationAttempted(false);
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
