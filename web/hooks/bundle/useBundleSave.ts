import { useCallback } from "react";
import { useBundleStore } from "@/stores";
import { useBundleValidation } from "@/hooks";

export function useBundleSave() {
    const {
        bundleData,
        selectedItems,
        displaySettings,
        configuration,
        setSaving,
        resetBundle,
    } = useBundleStore();

    const { validateAllSteps } = useBundleValidation();

    const saveBundle = useCallback(async () => {
        const validation = validateAllSteps();

        if (!validation.isValid) {
            throw new Error(
                `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`,
            );
        }

        setSaving(true);

        try {
            const bundlePayload = {
                ...bundleData,
                products: selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
                displaySettings,
                configuration,
            };

            // TODO: Replace with actual API call
            const response = await fetch("/api/bundles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bundlePayload),
            });

            if (!response.ok) {
                throw new Error("Failed to save bundle");
            }

            const result = await response.json();

            // Reset the bundle store after successful save
            resetBundle();

            return result;
        } catch (error) {
            console.error("Save bundle error:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [
        bundleData,
        selectedItems,
        displaySettings,
        configuration,
        validateAllSteps,
        setSaving,
        resetBundle,
    ]);

    const saveDraft = useCallback(async () => {
        setSaving(true);

        try {
            const draftPayload = {
                ...bundleData,
                products: selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
                displaySettings,
                configuration,
                status: "draft",
            };

            // TODO: Replace with actual API call
            const response = await fetch("/api/bundles/draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(draftPayload),
            });

            if (!response.ok) {
                throw new Error("Failed to save draft");
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Save draft error:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [bundleData, selectedItems, displaySettings, configuration, setSaving]);

    return {
        saveBundle,
        saveDraft,
        isSaving: useBundleStore((state) => state.isSaving),
    };
}
