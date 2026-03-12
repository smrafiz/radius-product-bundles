import { getSettingsAction, getLocalesAction } from "@/features/settings/actions/settings.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { settingsQueryKeys } from "@/features/settings";
import { queryOptions } from "@tanstack/react-query";

/**
 * Settings query options factory
 * Pure query configuration without hooks
 */
export function settingsQueries(app: ReturnType<typeof useAppBridge>) {
    return {
        detail: () =>
            queryOptions({
                queryKey: settingsQueryKeys.detail(),
                queryFn: async () => {
                    const token = await app.idToken();
                    const result = await getSettingsAction(token);

                    if (result.status === "error") {
                        throw new Error(result.message);
                    }

                    return result.data;
                },
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 2,
            }),

        locales: () =>
            queryOptions({
                queryKey: settingsQueryKeys.locales(),
                queryFn: async () => {
                    const token = await app.idToken();
                    const result = await getLocalesAction(token);

                    if (result.status === "error") {
                        throw new Error(result.message);
                    }

                    return result.data;
                },
                staleTime: 30 * 60 * 1000,
                gcTime: 60 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 2,
            }),
    };
}
