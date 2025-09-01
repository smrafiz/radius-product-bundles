import { useBundleStore } from '@/stores';
import { bundleSchema } from '@/lib/validation';

export function useBundleValidation() {
    const { bundleData, selectedItems, validationAttempted, currentStep } = useBundleStore();

    const getValidationData = () => ({
        ...bundleData,
        products: selectedItems,
        discountValue: bundleData.discountValue || 0,
        minOrderValue: bundleData.minOrderValue,
        maxDiscountAmount: bundleData.maxDiscountAmount,
    });

    const validateCurrentStep = () => {
        const data = getValidationData();

        switch (currentStep) {
            case 1: // Products step
                const productsSchema = bundleSchema.pick({ products: true });
                return productsSchema.safeParse(data);

            case 2: // Configuration step
                const configSchema = bundleSchema.pick({
                    name: true,
                    discountType: true,
                    discountValue: true,
                    minOrderValue: true,
                    maxDiscountAmount: true
                });
                return configSchema.safeParse(data);

            case 3: // Display step
                return { success: true } as const;

            case 4: // Review step
                return bundleSchema.safeParse(data);

            default:
                return { success: false } as const;
        }
    };

    const getFieldError = (fieldName: string): string | undefined => {
        if (!validationAttempted) return undefined;

        const result = validateCurrentStep();

        if (!result.success && 'error' in result && result.error) {
            const fieldError = result.error.issues.find((issue) =>
                issue.path.includes(fieldName)
            );
            return fieldError?.message;
        }

        return undefined;
    };

    const canProceedToNextStep = (): boolean => {
        const result = validateCurrentStep();
        return result.success;
    };

    const getAllErrors = () => {
        if (!validationAttempted) return [];

        const result = validateCurrentStep();
        if (!result.success && 'error' in result && result.error) {
            return result.error.issues;
        }
        return [];
    };

    return {
        getFieldError,
        canProceedToNextStep,
        getAllErrors,
        validateCurrentStep,
    };
}