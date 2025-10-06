import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useBundleStore } from "@/stores";
import { bundleSchema, BundleFormData } from "@/lib/validation";

export function useBundleValidation() {
    const form = useFormContext<BundleFormData>();
    const { currentStep, validationAttempted } = useBundleStore();

    if (!form) {
        throw new Error(
            "useBundleValidation must be used within BundleFormProvider",
        );
    }

    const {
        formState: { errors },
        getValues,
        trigger,
    } = form;

    // Get current step validation rules
    const getStepFields = (step: number): (keyof BundleFormData)[] => {
        switch (step) {
            case 1:
                return ["products"];
            case 2:
                return ["name", "discountType", "discountValue"];
            case 3:
                return []; // Display step has no form validation
            case 4:
                return Object.keys(
                    bundleSchema.shape,
                ) as (keyof BundleFormData)[];
            default:
                return [];
        }
    };

    // Validate current step
    const validateCurrentStep = async () => {
        const fields = getStepFields(currentStep);
        if (fields.length === 0) return true;

        return await trigger(fields);
    };

    // Check if current step can proceed
    const canProceedToNextStep = useMemo(() => {
        const fields = getStepFields(currentStep);

        if (fields.length === 0) return true;

        // For step 1 (products), just check if products exist
        if (currentStep === 1) {
            const products = getValues("products");
            return Array.isArray(products) && products.length > 0;
        }

        // For other steps, check field values
        return fields.every((field) => {
            const value = getValues(field);

            // Special handling for discountValue based on discountType
            if (field === "discountValue") {
                const discountType = getValues("discountType");
                const requiresValue = [
                    "PERCENTAGE",
                    "FIXED_AMOUNT",
                    "CUSTOM_PRICE",
                ].includes(discountType || "");

                if (!requiresValue) return true;
                return value !== undefined && value > 0;
            }

            return value !== undefined && value !== "";
        });
    }, [currentStep, getValues]);

    // Get field error message (only show if validation was attempted)
    const getFieldError = (
        fieldName: keyof BundleFormData,
    ): string | undefined => {
        if (!validationAttempted) return undefined;
        return errors[fieldName]?.message;
    };

    // Get all current errors (only if validation was attempted) - FIXED STRUCTURE
    const getAllErrors = () => {
        if (!validationAttempted) return [];
        return Object.entries(errors).map(([field, error]) => ({
            field,
            path: field, // Add path property for compatibility
            message: error?.message || "Invalid value",
        }));
    };

    return {
        validateCurrentStep,
        canProceedToNextStep,
        getFieldError,
        getAllErrors,
        errors: validationAttempted ? errors : {},
        isValid: Object.keys(errors).length === 0,
    };
}
