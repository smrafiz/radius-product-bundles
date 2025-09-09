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
    initialData?: Partial<BundleFormData>;
}

export function BundleFormProvider({
    children,
    bundleType,
    initialData,
}: BundleFormProviderProps) {
    const { bundleData, selectedItems, setBundleData, markDirty } =
        useBundleStore();

    const form = useForm<BundleFormData>({
        resolver: zodResolver(bundleSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            type: bundleType,
            products: initialData?.products || [],
            discountType: initialData?.discountType || undefined,
            discountValue: initialData?.discountValue || undefined,
            minOrderValue: initialData?.minOrderValue || undefined,
            maxDiscountAmount: initialData?.maxDiscountAmount || undefined,
            startDate: initialData?.startDate || undefined,
            endDate: initialData?.endDate || undefined,
        },
        mode: "onChange", // Changed to onChange for immediate validation
    });

    const { setValue, watch, reset, formState } = form;

    // Set bundle type when provider mounts
    useEffect(() => {
        setValue("type", bundleType, { shouldValidate: true });
        setBundleData({ ...bundleData, type: bundleType });
    }, [bundleType, setValue, setBundleData]);

    // Sync selectedItems with form products and mark dirty
    useEffect(() => {
        const products = selectedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
        }));
        setValue("products", products, { shouldDirty: true });
        markDirty(); // Always mark dirty when products change
    }, [selectedItems, setValue, markDirty]);

    // Watch for ANY form changes and mark dirty immediately
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name && type === "change") {
                // Update store with form values
                setBundleData({
                    ...value,
                    type: bundleType,
                } as any);

                // Mark dirty for save bar
                markDirty();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setBundleData, markDirty, bundleType]);

    // Also watch formState.isDirty for additional safety
    useEffect(() => {
        if (formState.isDirty) {
            markDirty();
        }
    }, [formState.isDirty, markDirty]);

    // Reset form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    return <FormProvider {...form}>{children}</FormProvider>;
}

export default BundleFormProvider;
