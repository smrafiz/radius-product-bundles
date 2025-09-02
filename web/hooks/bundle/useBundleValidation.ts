import { useMemo } from "react";
import { useBundleStore } from "@/stores";
import { bundleSchema } from "@/lib/validation";

export function useBundleValidation() {
    const { bundleData, selectedItems, validationAttempted, currentStep } =
        useBundleStore();

    // Memoize validation data to prevent excessive recalculations
    const validationData = useMemo(() => {
        return {
            ...bundleData,
            products: selectedItems,
            discountValue: bundleData.discountValue,
            minOrderValue: bundleData.minOrderValue,
            maxDiscountAmount: bundleData.maxDiscountAmount,
        };
    }, [bundleData, selectedItems]);

    // Memoize validation result to prevent excessive validation calls
    const validationResult = useMemo(() => {
        let result;

        switch (currentStep) {
            case 1: // Product step
                const productsSchema = bundleSchema.pick({ products: true });
                result = productsSchema.safeParse(validationData);
                break;

            case 2: // Configuration step
                const configData = {
                    ...validationData,
                    products: validationData.products?.length
                        ? validationData.products
                        : [{ id: "temp" }],
                    startDate: undefined,
                    endDate: undefined,
                };
                result = bundleSchema.safeParse(configData);
                break;

            case 3: // Display step
                result = { success: true } as const;
                break;

            case 4: // Review step
                result = bundleSchema.safeParse(validationData);
                break;

            default:
                result = { success: false, error: { issues: [] } } as const;
        }

        return result;
    }, [validationData, currentStep, validationAttempted]);

    const validateCurrentStep = () => {
        return validationResult;
    };

    const getFieldError = (fieldName: string): string | undefined => {
        if (!validationAttempted) {
            return undefined;
        }

        if (
            !validationResult.success &&
            "error" in validationResult &&
            validationResult.error
        ) {
            const fieldError = validationResult.error.issues.find((issue) =>
                issue.path.includes(fieldName),
            );

            return fieldError?.message;
        }

        return undefined;
    };

    const canProceedToNextStep = (): boolean => {
        return validationResult.success;
    };

    const getAllErrors = () => {
        if (!validationAttempted) {
            return [];
        }

        if (
            !validationResult.success &&
            "error" in validationResult &&
            validationResult.error
        ) {
            return validationResult.error.issues;
        }

        return [];
    };

    return {
        getFieldError,
        canProceedToNextStep,
        getAllErrors,
        validateCurrentStep,
        validationData,
    };
}
