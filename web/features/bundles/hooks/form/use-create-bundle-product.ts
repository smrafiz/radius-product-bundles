"use client";

import { useState } from "react";
import { BundleStatus } from "@/features/bundles";
import { useAppBridge } from "@shopify/app-bridge-react";
import { createBundleProductAction } from "@/features/bundles/actions";

/**
 * Hook for creating a Shopify product when the bundle is submitted.
 * Product status is synced with bundle status.
 */
export function useCreateBundleProduct() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const app = useAppBridge();

    /**
     * Creates a Shopify product for the bundle.
     */
    const createProduct = async (
        bundleName: string,
        bundleDescription?: string,
        bundleType?: string,
        bundlePrice?: number,
        originalPrice?: number,
        bundleStatus?: BundleStatus,
    ) => {
        setIsCreating(true);
        setError(null);

        try {
            const sessionToken = await app.idToken();

            const result = await createBundleProductAction(sessionToken, {
                bundleName,
                bundleDescription,
                bundleType,
                bundleStatus,
                bundlePrice,
                originalPrice,
            });

            if (result.status === "error") {
                setError(result.message || null);
                return null;
            }

            return result.data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create product";
            setError(errorMessage);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createProduct,
        isCreating,
        error,
    };
}
