"use client";

import {
    BundleFormData,
    BundleFormProviderProps,
    bundleSchema,
    DiscountType,
    setStoreInitializing,
    useBundleStore,
} from "@/features/bundles";
import type { z } from "zod";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettingsStore } from "@/features/settings";
import { blockSaveBar, VALIDATION_ERROR } from "@/shared";
import { BundleCreationSkeleton } from "@/features/bundles";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

/**
 * Provides form context for bundle creation and editing.
 */
export function BundleFormProvider({
    children,
    bundleType,
    initialData,
}: BundleFormProviderProps) {
    const {
        selectedItems,
        setBundleData,
        resetBundle,
        setStep,
        setValidationAttempted,
    } = useBundleStore();

    const isEditMode = Boolean(initialData);
    const isInitialized = useRef(false);

    const serverData = useSettingsStore((s) => s.serverData);
    const isSettingsLoading = useSettingsStore((s) => s.isLoading);
    const settings = useSettingsStore.getState().getEffectiveData();

    const isNewBundle = !initialData;
    const isWaitingForSettings =
        isNewBundle && isSettingsLoading && !serverData;

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
            discountType: (initialData?.discountType ??
                settings.defaultDiscountType) as DiscountType,
            discountValue:
                initialData?.discountValue ??
                (settings.defaultDiscountValue as number) ??
                0,
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

            setTimeout(() => {
                setStoreInitializing(false);
                blockSaveBar(false);
            }, 300);
        }
    }, []);

    // Listen for validation errors and navigate to the correct step
    useEffect(() => {
        const handleValidationError = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { step } = customEvent.detail || {};

            if (step && step >= 1 && step <= 4) {
                setStep(step);
                setValidationAttempted(true);
            }
        };

        window.addEventListener(VALIDATION_ERROR, handleValidationError);

        return () => {
            window.removeEventListener(VALIDATION_ERROR, handleValidationError);
        };
    }, [setStep, setValidationAttempted]);

    // Set the bundle type in form
    useEffect(() => {
        setValue("type", bundleType, { shouldValidate: true });
    }, [bundleType, setValue]);

    // Sync selectedItems with form products
    useEffect(() => {
        // Skip if not initialized or no items
        if (!isInitialized.current || selectedItems.length === 0) {
            return;
        }

        const products = selectedItems.flatMap((item) => {
            if (
                item.variantIds &&
                Array.isArray(item.variantIds) &&
                item.variantIds.length > 0
            ) {
                return item.variantIds.map((variantId) => ({
                    productId: item.productId,
                    variantId: variantId,
                    quantity: item.quantity || 1,
                    role: "INCLUDED" as const,
                }));
            }

            if (item.variantId) {
                return [
                    {
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity || 1,
                        role: "INCLUDED" as const,
                    },
                ];
            }

            return [];
        });

        if (products.length > 0) {
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

    if (isWaitingForSettings) {
        return <BundleCreationSkeleton mode="create" />;
    }

    return <FormProvider {...form}>{children}</FormProvider>;
}

export default BundleFormProvider;
