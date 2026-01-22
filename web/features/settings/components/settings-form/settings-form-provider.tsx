"use client";

import {
    AppSettingsFormData,
    appSettingsSchema,
    mergeWithDefaults,
    SettingsFormProviderProps,
} from "@/features/settings";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

/**
 * Provides form context for app settings.
 */
export function SettingsFormProvider({
    children,
    initialData,
    onDirtyChange,
}: SettingsFormProviderProps) {
    const isInitialized = useRef(false);

    // Merge initial data with config-driven defaults
    const defaultValues = mergeWithDefaults(initialData);

    const form = useForm<AppSettingsFormData>({
        resolver: zodResolver(
            appSettingsSchema,
        ) as Resolver<AppSettingsFormData>,
        defaultValues,
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
