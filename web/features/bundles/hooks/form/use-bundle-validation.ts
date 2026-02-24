"use client";

import {
    BundleFormData,
    bundleSchema,
    useBundleStore,
} from "@/features/bundles";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { BundleProductRole } from "@/prisma/generated/client";

export function useBundleValidation() {
    const form = useFormContext<BundleFormData>();
    const {
        currentStep,
        validationAttempted,
        getGroupedItems,
        selectedItems,
        displaySettings,
        isFieldTouched,
    } = useBundleStore();

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
    const getStepFields = (step: number): string[] => {
        switch (step) {
            case 1:
                return ["name", "products"];
            case 2:
                return ["discountType", "discountValue"];
            case 3:
                return ["settings.title", "settings.cartButtonText"];
            case 4:
                return Object.keys(bundleSchema.shape);
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
                const itemRole = (item.role as BundleProductRole) || "INCLUDED";

                if (item.variantIds && Array.isArray(item.variantIds)) {
                    return item.variantIds.map((variantId) => ({
                        productId: item.productId.replace(/^product-/, ""),
                        variantId: variantId,
                        quantity: item.quantity || 1,
                        role: itemRole,
                    }));
                }

                if (item.variantId) {
                    return [
                        {
                            productId: item.productId.replace(/^product-/, ""),
                            variantId: item.variantId,
                            quantity: item.quantity || 1,
                            role: itemRole,
                        },
                    ];
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

        return await trigger(fields as any);
    };

    // Check if the current step can proceed
    const canProceedToNextStep = useMemo(() => {
        const fields = getStepFields(currentStep);

        if (fields.length === 0) {
            return true;
        }

        // For step 1
        if (currentStep === 1) {
            const name = getValues("name");
            const groupedItems = getGroupedItems();

            const hasValidName = name && name.trim().length > 0;
            const hasMinimumProducts =
                Array.isArray(groupedItems) && groupedItems.length >= 2;

            return hasValidName && hasMinimumProducts;
        }

        // For other steps, check field values
        return fields.every((field) => {
            const value = getValues(field as any);

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
                return (
                    value !== undefined &&
                    !isNaN(numericValue) &&
                    numericValue > 0
                );
            }

            return value !== undefined && value !== "";
        });
    }, [currentStep, getValues, getGroupedItems, displaySettings]);

    // Get field error message (show if field is touched or validation was attempted)
    const getFieldError = (fieldName: string): string | undefined => {
        if (!validationAttempted && !isFieldTouched(fieldName))
            return undefined;

        // Support nested paths like "settings.title"
        const error = fieldName.includes(".")
            ? fieldName.split(".").reduce((obj: any, key) => obj?.[key], errors)
            : errors[fieldName as keyof BundleFormData];

        return error?.message;
    };

    // Get all current errors (touched fields + all if validation attempted)
    const getAllErrors = () => {
        const entries = Object.entries(errors);

        if (!validationAttempted) {
            return entries
                .filter(([field]) => isFieldTouched(field))
                .map(([field, error]) => ({
                    field,
                    path: field,
                    message: error?.message || "Invalid value",
                }));
        }

        return entries.map(([field, error]) => ({
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
        errors: validationAttempted
            ? errors
            : Object.fromEntries(
                  Object.entries(errors).filter(([key]) => isFieldTouched(key)),
              ),
        isValid: Object.keys(errors).length === 0,
    };
}
