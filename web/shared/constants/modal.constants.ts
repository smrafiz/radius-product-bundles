import { ModalPayload } from "@/shared";
import { BUNDLE_STATUSES, BundleStatus } from "@/features/bundles";

/**
 * Modal Content Configuration
 */
export const MODAL_CONTENT = (modal: ModalPayload | { type: null }) => {
    if (!modal || modal.type === null) {
        return {
            heading: "Confirm",
            message: "",
            destructive: false,
        };
    }

    switch (modal.type) {
        case "duplicate":
            return {
                heading: modal.title || "Duplicate Bundle",
                message:
                    modal.message ||
                    `Duplicate <strong>${modal.bundle?.name}?</strong> A new draft will be created.`,
                destructive: false,
            };

        case "delete":
            return {
                heading: modal.title || "Delete Bundle",
                message:
                    modal.message ||
                    `Are you sure you want to delete <strong>${modal.bundle?.name}</strong>? This action cannot be undone.`,
                destructive: true,
            };

        case "status":
            return {
                heading: modal.title || "Confirm Status Change",
                message:
                    modal.message ||
                    `Change the status of <strong>${modal.bundle?.name}</strong> to <strong>${
                        modal.newStatus
                            ? BUNDLE_STATUSES[modal.newStatus as BundleStatus]
                                  ?.text
                            : ""
                    }</strong>?`,
                destructive: false,
            };

        case "delete-product":
            return {
                heading: modal.title || "Delete bundle product?",
                message:
                    modal.message ||
                    `Turning off this switch will permanently delete <strong>${modal.productTitle || "this product"}</strong> from your store when you save. This action cannot be undone.`,
                destructive: true,
            };

        default:
            return {
                heading: "Confirm Action",
                message: "Are you sure you want to continue?",
                destructive: false,
            };
    }
};
