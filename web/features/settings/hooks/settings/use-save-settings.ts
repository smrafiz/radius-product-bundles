"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { saveSettingsAction } from "@/features/settings/actions/settings.action";
import {
    AppSettingsFormData,
    settingsQueryKeys,
    useSettingsStore,
} from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Hook to save settings to API
 */
export function useSaveSettingsMutation() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { setServerData, resetDirty } = useSettingsStore();
    const t = useTranslations("Settings.Toast");

    return useMutation({
        mutationFn: async (data: AppSettingsFormData) => {
            const token = await app.idToken();
            const locale = useSettingsStore.getState().labelsLocale;
            const result = await saveSettingsAction(
                token,
                data,
                locale ?? undefined,
            );

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data;
        },
        onSuccess: (savedData) => {
            if (savedData) {
                // Update React Query cache
                queryClient.setQueryData(settingsQueryKeys.detail(), savedData);

                // Update Zustand store
                setServerData(savedData);
                resetDirty();

                // Invalidate per-locale labels caches so previews pick up
                // newly-saved translations across all locales.
                queryClient.invalidateQueries({
                    queryKey: settingsQueryKeys.allLabels(),
                });
            }

            // Show success notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(t("saveSuccess"), {
                    duration: 3000,
                });
            }
        },
        onError: (error: Error) => {
            // Show error notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(error.message || t("saveError"), {
                    duration: 5000,
                    isError: true,
                });
            }
        },
    });
}
