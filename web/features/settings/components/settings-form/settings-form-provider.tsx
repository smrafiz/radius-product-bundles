"use client";

import {
    AppSettingsFormData,
    mergeWithDefaults,
    SettingsFormProviderProps,
} from "@/features/settings";
import { generateSettingsSchema } from "@/features/settings/schema/zod-schema.generator";
import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Provides form context for app settings.
 */
export function SettingsFormProvider({
    children,
    initialData,
    onDirtyChange,
}: SettingsFormProviderProps) {
    const isInitialized = useRef(false);
    const v = useTranslations("Validation");
    const schema = useMemo(() => generateSettingsSchema(v), [v]);

    // Merge initial data with config-driven defaults
    const defaultValues = mergeWithDefaults(initialData);

    const form = useForm<AppSettingsFormData>({
        resolver: zodResolver(schema) as Resolver<AppSettingsFormData>,
        defaultValues,
        mode: "onChange",
    });

    const {
        formState: { isDirty },
        reset,
    } = form;

    // Reset form when initialData changes (on refetch)
    useEffect(() => {
        if (initialData && isInitialized.current) {
            const mergedData = mergeWithDefaults(initialData);
            reset(mergedData, { keepDirty: false });
        }
    }, [initialData, reset]);

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
