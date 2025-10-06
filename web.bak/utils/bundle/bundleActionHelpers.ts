import { bundleQueries } from "@/lib/queries";
import type { BundleFormData } from "@/lib/validation";
import { ApiError } from "@/types";

export async function checkNameConflict(shop: string, name: string, excludeId?: string) {
    const existingBundle = excludeId
        ? await bundleQueries.findByNameWithExclusion(shop, name, excludeId)
        : await bundleQueries.findByName(shop, name);

    if (existingBundle) {
        throw new Error(`Bundle with name "${name}" already exists`);
    }
}

export function inferBundleType(data: BundleFormData) {
    if (data.discountType === "NO_DISCOUNT") return "FREQUENTLY_BOUGHT_TOGETHER";
    if (data.discountType === "FREE_SHIPPING") return "FIXED_BUNDLE";
    return "FIXED_BUNDLE";
}

export function handleBundleError(error: unknown): ApiError {
    console.error("Bundle operation failed:", error);

    if (error instanceof Error) {
        if (error.message.includes("already exists")) {
            return {
                status: "error",
                message: error.message,
                errors: [error.message],
            };
        }
        if (error.message.includes("not found")) {
            return {
                status: "error",
                message: error.message,
            };
        }
    }

    return {
        status: "error",
        message: "Operation failed. Please try again.",
    };
}