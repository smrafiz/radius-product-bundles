"use client";

import { useBundleStore } from "@/stores";
import type { BundleType } from "@/types";
import { ReactNode, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { BundleFormData, bundleSchema } from "@/lib/validation";

interface BundleFormProviderProps {
    children: ReactNode;
    bundleType: BundleType;
}

export function BundleFormProvider({
    children,
    bundleType,
}: BundleFormProviderProps) {
    const { bundleData, selectedItems, setBundleData, markDirty } =
        useBundleStore();

    // Initialize the form with React Hook Form
    const form = useForm<BundleFormData>({
        resolver: zodResolver(bundleSchema),
        defaultValues: {
            name: "",
            description: "",
            products: [],
            discountType: undefined,
            discountValue: undefined,
            minOrderValue: undefined,
            maxDiscountAmount: undefined,
            startDate: undefined,
            endDate: undefined,
        },
        mode: "onChange",
    });

    const { setValue, watch } = form;

    // Set bundle type when provider mounts
    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
        }
    }, [bundleType, bundleData, setBundleData]);

    // Sync form with Zustand store
    useEffect(() => {
        const formData = {
            name: bundleData.name || "",
            description: bundleData.description || "",
            discountType: bundleData.discountType,
            discountValue: bundleData.discountValue,
            minOrderValue: bundleData.minOrderValue,
            maxDiscountAmount: bundleData.maxDiscountAmount,
            startDate: bundleData.startDate,
            endDate: bundleData.endDate,
            products: selectedItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            })),
        };

        // Update form values when store changes
        Object.entries(formData).forEach(([key, value]) => {
            const currentValue = watch(key as keyof BundleFormData);
            if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
                setValue(key as keyof BundleFormData, value);
            }
        });
    }, [bundleData, selectedItems, setValue, watch]);

    // Sync store with form changes
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name && type === "change") {
                setBundleData({
                    ...value,
                    type: bundleType, // Ensure type is always set
                });
                markDirty();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setBundleData, markDirty, bundleType]);

    return <FormProvider {...form}>{children}</FormProvider>;
}

export default BundleFormProvider;
