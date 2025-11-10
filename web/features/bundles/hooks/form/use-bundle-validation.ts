"use client";

import {
    BundleFormData,
    bundleSchema,
    useBundleStore,
} from "@/features/bundles";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { BundleProductRole } from "@prisma/client";

export function useBundleValidation() {
    const form = useFormContext<BundleFormData>();
    const { currentStep, validationAttempted, getGroupedItems, selectedItems } = useBundleStore();

    if (!form) {
        throw new Error(
            "useBundleValidation must be used within BundleFormProvider",
        );
    }

    const {
        formState: { errors },
        getValues,
        trigger,
        setValue,
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

        if (fields.length === 0) {
            return true;
        }

        if (currentStep === 1) {
            const productsForForm: Array<{
                productId: string;
                variantId: string;
                quantity: number;
                role: BundleProductRole;
            }> = selectedItems.flatMap((item) => {
                if (item.variantIds && Array.isArray(item.variantIds)) {
                    return item.variantIds.map((variantId) => ({
                        productId: item.productId.replace(/^product-/, ""),
                        variantId: variantId,
                        quantity: item.quantity || 1,
                        role: "INCLUDED",
                    }));
                }

                if (item.variantId) {
                    return [{
                        productId: item.productId.replace(/^product-/, ""),
                        variantId: item.variantId,
                        quantity: item.quantity || 1,
                        role: "INCLUDED",
                    }];
                }

                return [];
            });

            // Sync to form state
            setValue("products", productsForForm, {
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: true,
            });
        }

        return await trigger(fields);
    };

    // Check if the current step can proceed
    const canProceedToNextStep = useMemo(() => {
        const fields = getStepFields(currentStep);

        if (fields.length === 0) return true;

        // For step 1 (products), check grouped items from store
        if (currentStep === 1) {
            const groupedItems = getGroupedItems();
            return Array.isArray(groupedItems) && groupedItems.length > 0;
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

                const numericValue = Number(value);
                return value !== undefined && !isNaN(numericValue) && numericValue > 0;
            }

            return value !== undefined && value !== "";
        });
    }, [currentStep, getValues, getGroupedItems]);

    // Get field error message (only show if validation was attempted)
    const getFieldError = (
        fieldName: keyof BundleFormData,
    ): string | undefined => {
        if (!validationAttempted) return undefined;
        return errors[fieldName]?.message;
    };

    // Get all current errors (only if validation was attempted)
    const getAllErrors = () => {
        if (!validationAttempted) return [];
        return Object.entries(errors).map(([field, error]) => ({
            field,
            path: field,
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