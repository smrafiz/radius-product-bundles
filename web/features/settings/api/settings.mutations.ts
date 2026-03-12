import { MutationOptions } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { AppSettingsFormData } from "@/features/settings";
import {
    resetSettingsAction,
    saveSettingsAction,
} from "@/features/settings/actions/settings.action";
import { useSettingsStore } from "@/features/settings/stores/settings.store";

/**
 * Settings mutation options factory.
 */
export function settingsMutations(app: ReturnType<typeof useAppBridge>) {
    return {
        /**
         * Mutation options for saving settings.
         */
        save: (): MutationOptions<
            AppSettingsFormData,
            Error,
            AppSettingsFormData
        > => ({
            mutationFn: async (data: AppSettingsFormData) => {
                const token = await app.idToken();
                const locale = useSettingsStore.getState().labelsLocale;
                const result = await saveSettingsAction(token, data, locale ?? undefined);

                if (result.status === "error") {
                    throw new Error(result.message);
                }

                return result.data || {};
            },
        }),

        /**
         * Mutation options for resetting settings to defaults.
         */
        reset: (): MutationOptions<null, Error, void> => ({
            mutationFn: async () => {
                const token = await app.idToken();
                const result = await resetSettingsAction(token);

                if (result.status === "error") {
                    throw new Error(result.message);
                }

                return null;
            },
        }),
    };
}
