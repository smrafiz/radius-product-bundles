"use server";

import { ApiResponse } from "@/shared";
import { revalidatePath } from "next/cache";
import { handleSessionToken } from "@/lib/shopify/verify";
import {
    BundleStatus,
    deleteSingleBundleService,
    duplicateBundleService,
    updateBundleStatusService,
} from "@/features/bundles";

/**
 * Update bundle status
 */
export async function updateBundleStatus(
    sessionToken: string,
    bundleId: string,
    status: BundleStatus,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await updateBundleStatusService({
            bundleId,
            shop,
            status,
        });

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success",
            message: result.message || "Bundle status updated successfully",
            data: result.bundle,
        };
    } catch (error) {
        console.error("[updateBundleStatus] Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error" as const,
            message: errorMessage || "Failed to update bundle status",
            data: undefined,
            errors: [errorMessage],
        };
    }
}

/**
 * Delete a bundle
 */
export async function deleteBundle(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await deleteSingleBundleService({
            bundleId,
            shop,
        });

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success",
            message: result.message || "Bundle deleted successfully",
            data: result.bundle,
        };
    } catch (error) {
        console.error("[deleteBundle] Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error" as const,
            message: errorMessage || "Failed to delete bundle",
            data: undefined,
            errors: [errorMessage],
        };
    }
}

/**
 * Duplicate a single bundle
 */
export async function duplicateBundle(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await duplicateBundleService({
            bundleId,
            shop,
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            ...result,
        };
    } catch (error) {
        console.error("[duplicateBundle] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to duplicate bundle",
            data: null,
        };
    }
}
