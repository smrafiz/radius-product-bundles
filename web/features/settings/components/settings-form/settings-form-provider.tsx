"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import { APP_SETTINGS } from "@/features/settings/constants/defaults.constants";
import {
    AppSettingsFormData,
    appSettingsSchema,
    SettingsFormProviderProps,
} from "@/features/settings";

/**
 * Provides form context for app settings.
 *
 * Wraps children with RHF FormProvider configured with Zod validation.
 */
export function SettingsFormProvider({
    children,
    initialData,
    onDirtyChange,
}: SettingsFormProviderProps) {
    const isInitialized = useRef(false);

    const form = useForm<AppSettingsFormData>({
        resolver: zodResolver(
            appSettingsSchema,
        ) as Resolver<AppSettingsFormData>,
        defaultValues: {
            // General - Defaults
            defaultDiscountType:
                initialData?.defaultDiscountType ??
                APP_SETTINGS.defaultDiscountType,
            defaultDiscountValue:
                initialData?.defaultDiscountValue ??
                APP_SETTINGS.defaultDiscountValue,
            maxBundleProducts:
                initialData?.maxBundleProducts ??
                APP_SETTINGS.maxBundleProducts,
            maxBundlesPerShop:
                initialData?.maxBundlesPerShop ??
                APP_SETTINGS.maxBundlesPerShop,

            // General - Cart Behavior
            redirectAfterCart:
                initialData?.redirectAfterCart ??
                APP_SETTINGS.redirectAfterCart,
            hidePaymentButtons:
                initialData?.hidePaymentButtons ??
                APP_SETTINGS.hidePaymentButtons,
            enableStockValidation:
                initialData?.enableStockValidation ??
                APP_SETTINGS.enableStockValidation,

            // General - Discount
            discountTitle:
                initialData?.discountTitle ?? APP_SETTINGS.discountTitle,
            trackOrdersWithoutDiscount:
                initialData?.trackOrdersWithoutDiscount ??
                APP_SETTINGS.trackOrdersWithoutDiscount,

            // General - Localization
            currencyDisplay:
                initialData?.currencyDisplay ?? APP_SETTINGS.currencyDisplay,
            disableCartLocale:
                initialData?.disableCartLocale ??
                APP_SETTINGS.disableCartLocale,

            // Labels
            labels: initialData?.labels ?? APP_SETTINGS.labels,

            // Style
            globalStyles:
                initialData?.globalStyles ?? APP_SETTINGS.globalStyles,

            // Advanced
            currencyFormat:
                initialData?.currencyFormat ?? APP_SETTINGS.currencyFormat,
            customCssClass:
                initialData?.customCssClass ?? APP_SETTINGS.customCssClass,
            customCss: initialData?.customCss ?? APP_SETTINGS.customCss,
        },
        mode: "onChange",
    });

    const {
        formState: { isDirty },
    } = form;

    // Notify parent of dirty state changes
    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // Mark as initialized
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
        }
    }, []);

    return <FormProvider {...form}>{children}</FormProvider>;
}
