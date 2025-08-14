import { useRouter } from "next/navigation";
import type { BundleStatus } from "@/types";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { DeleteIcon, DuplicateIcon } from "@shopify/polaris-icons";

export function useBundleTableActions() {
    const router = useRouter();
    const { showToast } = useBundlesStore();

    const handleCreateBundle = () => {
        router.push("/bundles/create");
    };

    const handleEditBundle = (bundleId: string) => {
        router.push(`/bundles/${bundleId}/edit`);
    };

    const handleDuplicateBundle = (bundleId: string) => {
        showToast(`Duplicating bundle ${bundleId}...`);
        console.log("Duplicate bundle:", bundleId);
    };

    const handleToggleBundleStatus = (
        bundleId: string,
        currentStatus: BundleStatus,
    ) => {
        const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
        showToast(`Bundle status changed to ${newStatus.toLowerCase()}`);
        console.log("Toggle status for bundle:", bundleId, currentStatus);
    };

    const handleDeleteBundle = (bundleId: string) => {
        showToast("Bundle deleted successfully");
        console.log("Delete bundle:", bundleId);
    };

    const handleBulkActivate = (selectedCount: number) => {
        showToast(`Activated ${selectedCount} bundles`);
        console.log("Bulk activate:", selectedCount);
    };

    const handleBulkPause = (selectedCount: number) => {
        showToast(`Paused ${selectedCount} bundles`);
        console.log("Bulk pause:", selectedCount);
    };

    const handleBulkDelete = (selectedCount: number) => {
        showToast(`Deleted ${selectedCount} bundles`);
        console.log("Bulk delete:", selectedCount);
    };

    // Get promoted bulk actions
    const getPromotedBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
    ) => {
        const actions = [];

        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection actions
            actions.push(
                {
                    content: "Edit",
                    onAction: () => handleEditBundle(selectedBundle.id),
                },
                {
                    content:
                        selectedBundle.status === "ACTIVE"
                            ? "Set as draft"
                            : "Set as active",
                    onAction: () =>
                        handleToggleBundleStatus(
                            selectedBundle.id,
                            selectedBundle.status,
                        ),
                },
            );
        } else if (selectedResources.length > 1) {
            // Multiple selection actions
            actions.push(
                {
                    content: "Set as active",
                    onAction: () =>
                        handleBulkActivate(selectedResources.length),
                },
                {
                    content: "Set as draft",
                    onAction: () => handleBulkPause(selectedResources.length),
                },
            );
        }

        return actions;
    };

    // Get bulk actions (dropdown)
    const getBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
    ) => {
        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection dropdown actions
            return [
                {
                    content: "Duplicate",
                    icon: DuplicateIcon,
                    onAction: () => handleDuplicateBundle(selectedBundle.id),
                },
                {
                    content: "Delete bundle",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => handleDeleteBundle(selectedBundle.id),
                },
            ];
        } else if (selectedResources.length > 1) {
            // Multiple selection dropdown actions
            return [
                {
                    content: "Delete bundles",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => handleBulkDelete(selectedResources.length),
                },
            ];
        }
        return [];
    };

    return {
        handleCreateBundle,
        handleEditBundle,
        handleDuplicateBundle,
        handleToggleBundleStatus,
        handleDeleteBundle,
        handleBulkActivate,
        handleBulkPause,
        handleBulkDelete,
        getPromotedBulkActions,
        getBulkActions,
    };
}
