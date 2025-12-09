"use client";

import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { generateUniqueBundleNameAction } from "@/features/bundles/actions";

/**
 * Hook to auto-generate a unique bundle name based on the bundle type
 */
export function useAutoGenerateName(bundleType: string, isEditMode: boolean) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedName, setGeneratedName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const app = useAppBridge();

    useEffect(() => {
        // Only generate for new bundles, not edit mode
        if (isEditMode || !bundleType || generatedName) {
            return;
        }

        const generateName = async () => {
            setIsGenerating(true);
            setError(null);

            try {
                const sessionToken = await app.idToken();
                const result = await generateUniqueBundleNameAction(
                    sessionToken,
                    bundleType,
                );

                if (result.status === "success" && result.data) {
                    setGeneratedName(result.data);
                } else {
                    setError(result.message || "Failed to generate name");
                }
            } catch (err) {
                console.error("Failed to generate unique name:", err);
                setError("Failed to generate unique name");
            } finally {
                setIsGenerating(false);
            }
        };

        void generateName();
    }, [bundleType, isEditMode, generatedName, app]);

    return {
        generatedName,
        isGenerating,
        error,
    };
}
