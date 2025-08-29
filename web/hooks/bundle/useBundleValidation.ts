// web/hooks/useBundleValidation.ts
import { useBundleStore } from '@/stores';

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export function useBundleValidation() {
    const { bundleData, selectedItems, currentStep } = useBundleStore();

    const validateStep = (step: number): ValidationResult => {
        const errors: ValidationError[] = [];

        switch (step) {
            case 1: // Products step
                if (selectedItems.length === 0) {
                    errors.push({
                        field: 'products',
                        message: 'At least one product must be selected'
                    });
                }
                break;

            case 2: // Configuration step
                if (!bundleData.name?.trim()) {
                    errors.push({
                        field: 'name',
                        message: 'Bundle name is required'
                    });
                }

                if (!bundleData.discountType) {
                    errors.push({
                        field: 'discountType',
                        message: 'Discount type is required'
                    });
                }

                if (!bundleData.discountValue || bundleData.discountValue <= 0) {
                    errors.push({
                        field: 'discountValue',
                        message: 'Discount value must be greater than 0'
                    });
                }

                if (bundleData.discountType === 'PERCENTAGE' && bundleData.discountValue > 100) {
                    errors.push({
                        field: 'discountValue',
                        message: 'Percentage discount cannot exceed 100%'
                    });
                }

                if (bundleData.minOrderValue && bundleData.minOrderValue < 0) {
                    errors.push({
                        field: 'minOrderValue',
                        message: 'Minimum order value cannot be negative'
                    });
                }

                if (bundleData.maxDiscountAmount && bundleData.maxDiscountAmount < 0) {
                    errors.push({
                        field: 'maxDiscountAmount',
                        message: 'Maximum discount amount cannot be negative'
                    });
                }
                break;

            case 3: // Display step
                // Display step validation (if needed)
                break;

            case 4: // Review step
                // Final validation combining all previous steps
                const step1Validation = validateStep(1);
                const step2Validation = validateStep(2);
                errors.push(...step1Validation.errors, ...step2Validation.errors);
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const validateCurrentStep = (): ValidationResult => {
        return validateStep(currentStep);
    };

    const validateAllSteps = (): ValidationResult => {
        return validateStep(4); // This validates all steps
    };

    const getFieldError = (fieldName: string): string | null => {
        const validation = validateCurrentStep();
        const fieldError = validation.errors.find(error => error.field === fieldName);
        return fieldError ? fieldError.message : null;
    };

    const canProceedToNextStep = (): boolean => {
        return validateCurrentStep().isValid;
    };

    return {
        validateStep,
        validateCurrentStep,
        validateAllSteps,
        getFieldError,
        canProceedToNextStep,
    };
}