"use client";

import {
    BundleFormData,
    BundleFormProviderProps,
    bundleSchema,
    setStoreInitializing,
    useBundleStore,
} from "@/features/bundles";
import type { z } from "zod";
import { blockSaveBar } from "@/shared";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

/**
 * Provides form context for bundle creation and editing.
 */
export function BundleFormProvider({
    children,
    bundleType,
    initialData,
}: BundleFormProviderProps) {
    const { selectedItems, setBundleData, resetBundle, setStep } =
        useBundleStore();

    const isEditMode = Boolean(initialData);
    const isInitialized = useRef(false);

    const form = useForm<z.infer<typeof bundleSchema>>({
        resolver: zodResolver(bundleSchema) as Resolver<
            z.infer<typeof bundleSchema>
        >,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            type: bundleType,
            status: initialData?.status || "DRAFT",
            products: initialData?.products || [],
            discountType: initialData?.discountType,
            discountValue: initialData?.discountValue ?? 0,
            minOrderValue: initialData?.minOrderValue || undefined,
            maxDiscountAmount: initialData?.maxDiscountAmount || undefined,
            startDate: initialData?.startDate || undefined,
            endDate: initialData?.endDate || undefined,
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

    const { setValue, watch } = form;

    // Initialize store based on the mode
    useEffect(() => {
        if (!isInitialized.current) {
            // Block ALL save bar triggers during initialization
            setStoreInitializing(true);
            blockSaveBar(true);

            if (isEditMode && initialData) {
                setBundleData({
                    ...initialData,
                    type: bundleType,
                } as any);
                setStep(1);
            } else {
                resetBundle();
                setBundleData({ type: bundleType });
                setStep(1);
            }

            isInitialized.current = true;

            // Unblock after all effects have run
            setTimeout(() => {
                setStoreInitializing(false);
                blockSaveBar(false);
            }, 300);
        }
    }, []);

    // Set the bundle type in form
    useEffect(() => {
        setValue("type", bundleType, { shouldValidate: true });
    }, [bundleType, setValue]);

    // Sync selectedItems with form products (without triggering save bar)
    useEffect(() => {
        if (isInitialized.current) {
            const products = selectedItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId || "",
                quantity: item.quantity,
                role: "INCLUDED" as const,
            }));
            setValue("products", products, { shouldDirty: false });
        }
    }, [selectedItems, setValue]);

    // Watch for form changes and update store
    useEffect(() => {
        if (!isInitialized.current) return;

        const subscription = watch((value, { name, type }) => {
            if (name && type === "change") {
                const updatedData = {
                    [name]: value[name as keyof BundleFormData],
                    type: bundleType,
                };
                setBundleData(updatedData as any);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setBundleData, bundleType]);

    return <FormProvider {...form}>{children}</FormProvider>;
}

export default BundleFormProvider;
