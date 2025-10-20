import {
    BulkDeleteBundlesInput,
    BulkDeleteBundlesServiceResult,
    BUNDLE_STATUSES,
    bundleMutations,
    DeleteBundleInput,
    DeleteBundleServiceResult,
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

    async deleteBundle(
        input: DeleteBundleInput
    ): Promise<DeleteBundleServiceResult> {
        const { bundleId, shop } = input;

        const deletedBundle = await bundleMutations.deleteBundleWithRelations(bundleId, shop);

        return {
            success: true,
            bundle: deletedBundle,
            message: `Bundle "${deletedBundle.name}" deleted successfully`,
        };
    },

    async deleteBundles(
        input: BulkDeleteBundlesInput
    ): Promise<BulkDeleteBundlesServiceResult> {
        const { bundleIds, shop } = input;

        if (!bundleIds || bundleIds.length === 0) {
            throw new Error("No bundle IDs provided");
        }

        if (bundleIds.length > 100) {
            throw new Error("Cannot delete more than 100 bundles at once");
        }

        const deletedBundles = await bundleMutations.deleteBundlesWithRelations(bundleIds, shop);

        // Return result
        return {
            success: true,
            bundles: deletedBundles,
            deletedCount: deletedBundles.length,
            message: `${deletedBundles.length} bundle(s) deleted successfully`,
        };
    },
};