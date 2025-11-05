"use client";

import {
    BundleFormData,
    invalidateBundleCache,
    updateBundleAction,
    useBundleStore,
} from "@/features/bundles";
import { useGlobalBanner } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useQueryClient } from "@tanstack/react-query";

export function useEditBundleSubmit(bundleId: string) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { resetDirty, setSaving, setStep } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();

    const handleSubmit = async (data: BundleFormData) => {
        try {
            setSaving(true);
            const sessionToken = await app.idToken();

            if (!sessionToken) {
                showError("No session token", {
                    content: "Please try again later.",
                });
                return;
            }

            let result = await updateBundleAction(
                sessionToken,
                bundleId,
                data,
            );

            if (result.status === "error" &&
                (result.message?.includes("token") ||
                    result.message?.includes("exp") ||
                    result.message?.includes("session"))) {

                console.warn('[Submit] Token expired, retrying with fresh token...');

                const freshToken = await app.idToken();

                // Retry the request
                result = await updateBundleAction(freshToken, bundleId, data);
            }

            if (result.status === "success") {
                await invalidateBundleCache(queryClient);
                showSuccess("Bundle updated successfully!", {
                    content: "Your changes have been saved.",
                    autoHide: true,
                });
            } else {
                showError("Failed to update bundle", {
                    content:
                        result.message ||
                        "Please check your inputs and try again.",
                });
            }
        } catch (err) {
            console.error(err);
            showError("Update failed", {
                content: "Please try again later.",
            });
        } finally {
            setSaving(false);
            setStep(1);
        }
    };

    return { handleSubmit, resetDirty };
}
