"use client";

import {
    BundleFormData,
    updateBundleAction,
    useBundleStore,
} from "@/features/bundles";
import { useGlobalBanner, useSessionToken } from "@/shared";

export function useEditBundleSubmit(bundleId: string) {
    const sessionToken = useSessionToken();
    const { resetDirty, setSaving, setStep } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();

    const handleSubmit = async (data: BundleFormData) => {
        try {
            setSaving(true);
            if (!sessionToken) {
                showError("No session token", {
                    content: "Please try again later.",
                });
            }

            const result = await updateBundleAction(sessionToken, bundleId, data);

            if (result.status === "success") {
                showSuccess("Bundle updated successfully!", {
                    content: "Your changes have been saved.",
                    autoHide: true,
                });
            } else {
                showError("Failed to update bundle", {
                    content: "Please check your inputs and try again.",
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