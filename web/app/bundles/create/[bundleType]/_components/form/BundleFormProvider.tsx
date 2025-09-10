"use client";

import { useBundleStore } from "@/stores";
import type { BundleType } from "@/types";
import { ReactNode, useEffect, useRef } from "react";
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
    const {
        selectedItems,
        setBundleData,
        markDirty,
        resetBundle,
        setStep,
    } = useBundleStore();

    const isEditMode = Boolean(initialData);
    const isInitialized = useRef(false);

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

            // Add missing fields for edit mode
            mainProductId: initialData?.mainProductId || undefined,
            buyQuantity: initialData?.buyQuantity || undefined,
            getQuantity: initialData?.getQuantity || undefined,
            minimumItems: initialData?.minimumItems || undefined,
            maximumItems: initialData?.maximumItems || undefined,
            volumeTiers: initialData?.volumeTiers || undefined,
            allowMixAndMatch: initialData?.allowMixAndMatch || false,
            mixAndMatchPrice: initialData?.mixAndMatchPrice || undefined,
            marketingCopy: initialData?.marketingCopy || undefined,
            seoTitle: initialData?.seoTitle || undefined,
            seoDescription: initialData?.seoDescription || undefined,
            images: initialData?.images || [],
            productGroups: initialData?.productGroups || undefined,
            settings: initialData?.settings || undefined,
        },
        mode: "onChange",
    });

    const { setValue, watch, reset, formState } = form;

    // Initialize store based on mode (run once)
    useEffect(() => {
        if (!isInitialized.current) {
            if (isEditMode && initialData) {
                setBundleData({
                    ...initialData,
                    type: bundleType,
                } as any);

                setStep(1);
            } else {
                // Create mode: reset store
                resetBundle();
                setBundleData({ type: bundleType });
                setStep(1);
            }
            isInitialized.current = true;
        }
    }, []);

    // Set bundle type in form
    useEffect(() => {
        setValue("type", bundleType, { shouldValidate: true });
    }, [bundleType, setValue]);

    // Sync selectedItems with form products
    useEffect(() => {
        if (isInitialized.current) {
            const products = selectedItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId || "",
                quantity: item.quantity,
                role: "INCLUDED" as const,
            }));
            setValue("products", products, { shouldDirty: !isEditMode });

            if (!isEditMode && selectedItems.length > 0) {
                markDirty();
            }
        }
    }, [selectedItems, setValue, markDirty, isEditMode]);

    // Watch for form changes and update store (with debouncing)
    useEffect(() => {
        if (!isInitialized.current) return;

        const subscription = watch((value, { name, type }) => {
            if (name && type === "change") {
                // Only update specific fields to avoid infinite loops
                const updatedData = {
                    [name]: value[name as keyof BundleFormData],
                    type: bundleType,
                };

                setBundleData(updatedData as any);
                markDirty();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setBundleData, markDirty, bundleType]);

    // Watch formState.isDirty
    useEffect(() => {
        if (formState.isDirty && isInitialized.current) {
            markDirty();
        }
    }, [formState.isDirty, markDirty]);

    return <FormProvider {...form}>{children}</FormProvider>;
}

export default BundleFormProvider;
