"use client";

import {
    BundleFormData,
    invalidateBundleCache,
    createBundleAction,
    updateBundleAction,
    useBundleStore,
} from "@/features/bundles";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAppNavigation, useGlobalBanner, withAsyncLoader } from "@/shared";

type BundleSubmitMode = "create" | "edit";

export function useBundleSubmit(mode: BundleSubmitMode, bundleId?: string) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { setSaving, resetDirty, setStep } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();
    const { bundleData } = useAppNavigation();

    const handleSubmit = withAsyncLoader(async (data: BundleFormData) => {
        try {
            setSaving(true);
            let token = await app.idToken();
            let result;

            if (mode === "create") {
                result = await createBundleAction(token, data);
            } else if (mode === "edit" && bundleId) {
                result = await updateBundleAction(token, bundleId, data);
            } else {
                showError("Unexpected error", {
                    content: "Invalid mode or missing bundleId for edit.",
                });

                return;
            }

            // Token retry
            if (result.status === "error" &&
                (result.message?.includes("token") ||
                    result.message?.includes("exp") ||
                    result.message?.includes("session"))) {

                console.warn('[Submit] Token expired, retrying with fresh token...');

                const freshToken = await app.idToken();

                // Retry the request
                result =
                    mode === "create"
                        ? await createBundleAction(freshToken, data)
                        : await updateBundleAction(freshToken, bundleId!, data);
            }

            // Handle success
            if (result.status === "success") {
                await invalidateBundleCache(queryClient);

                if (mode === "create") {
                    showSuccess("Bundle created successfully!", {
                        content: "Your bundle has been created.",
                        autoHide: true,
                    });
                    // Navigate to edit page
                    bundleData.edit(result.data.id);
                } else {
                    showSuccess("Bundle updated successfully!", {
                        content: "Your changes have been saved.",
                        autoHide: true,
                    });
                }
            } else {
                showError("Failed to save bundle", {
                    content:
                        result.message || "Please check your inputs and try again.",
                });
            }
        } catch (error) {
            console.error(error);
            showError("Unexpected error", {
                content: "Please try again later.",
            });
        } finally {
            setSaving(false);
            setStep(1);
        }
    });

    return { handleSubmit, resetDirty };
}