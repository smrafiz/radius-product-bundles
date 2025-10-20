import {
    BUNDLE_STATUSES,
    bundleMutations,
    UpdateBundleStatusInput,
    UpdateBundleStatusResult,
} from "@/features/bundles";

export const bundleWriteService = {
    async updateBundleStatus(
        input: UpdateBundleStatusInput
    ): Promise<UpdateBundleStatusResult> {
        const { bundleId, shop, status } = input;

        if (!BUNDLE_STATUSES[status]) {
            throw new Error("Invalid bundle status");
        }

        const updatedBundle = await bundleMutations.updateStatusById(bundleId, shop, status);

        if (!updatedBundle) {
            throw new Error("Bundle not found");
        }

        return {
            success: true,
            bundle: updatedBundle,
            message: "Bundle status updated successfully",
        };
    },
};