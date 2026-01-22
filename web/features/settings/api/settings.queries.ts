import {
    getSettingsAction,
    resetSettingsAction,
    saveSettingsAction,
} from "@/features/settings/actions/settings.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppSettingsFormData, settingsQueryKeys, useSettingsStore, } from "@/features/settings";

/**
 * Settings query options factory
 */
export function settingsQueries(app: ReturnType<typeof useAppBridge>) {
    return {
        detail: {
            queryKey: settingsQueryKeys.detail(),
            queryFn: async () => {
                const token = await app.idToken();
                const result = await getSettingsAction(token);

                if (result.status === "error") {
                    throw new Error(result.message);
                }

                return result.data;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
        },
    };
}

/**
 * Hook to fetch settings
 */
export function useSettingsQuery() {
    const app = useAppBridge();
    const queries = settingsQueries(app);

    return useQuery({
        ...queries.detail,
    });
}

/**
 * Hook to save settings
 */
export function useSaveSettingsMutation() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { setServerData, resetDirty } = useSettingsStore();

    return useMutation({
        mutationFn: async (data: AppSettingsFormData) => {
            const token = await app.idToken();
            const result = await saveSettingsAction(token, data);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data;
        },
        onSuccess: (savedData) => {
            // Update cache
            queryClient.setQueryData(settingsQueryKeys.detail(), savedData);

            // Update store with server data
            setServerData(savedData);

            // Reset dirty state
            resetDirty();

            // Show success toast
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show("Settings saved successfully", {
                    duration: 3000,
                });
            }
        },
        onError: (error: Error) => {
            // Show error toast
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(error.message || "Failed to save settings", {
                    duration: 5000,
                    isError: true,
                });
            }
        },
    });
}

/**
 * Hook to reset settings
 */
export function useResetSettingsMutation() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { resetToDefaults } = useSettingsStore();

    return useMutation({
        mutationFn: async () => {
            const token = await app.idToken();
            const result = await resetSettingsAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data;
        },
        onSuccess: () => {
            // Invalidate cache to refetch
            void queryClient.invalidateQueries({
                queryKey: settingsQueryKeys.all,
            });

            // Reset store to defaults
            resetToDefaults();

            // Show success toast
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show("Settings reset to defaults", {
                    duration: 3000,
                });
            }
        },
        onError: (error: Error) => {
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(
                    error.message || "Failed to reset settings",
                    {
                        duration: 5000,
                        isError: true,
                    },
                );
            }
        },
    });
}
