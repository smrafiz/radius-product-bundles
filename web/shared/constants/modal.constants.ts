import { ModalPayload } from "@/shared";
import { BUNDLE_STATUSES, BundleStatus } from "@/features/bundles";

type TranslatorFn = (
    key: string,
    params?: Record<string, string | number>,
    defaultValue?: string,
) => string;

/**
 * Modal Content Configuration
 */
export const MODAL_CONTENT = (
    modal: ModalPayload | { type: null },
    t?: TranslatorFn,
    ts?: TranslatorFn,
) => {
    if (!modal || modal.type === null) {
        return {
            heading: t?.("confirm") ?? "Confirm",
            message: "",
            destructive: false,
        };
    }

    const bundleName = modal.bundle?.name ?? "";

    switch (modal.type) {
        case "duplicate":
            return {
                heading:
                    modal.title ||
                    t?.("duplicate.heading") ||
                    "Duplicate Bundle",
                message:
                    modal.message ||
                    t?.("duplicate.message", {
                        name: `<strong>${bundleName}</strong>`,
                    }) ||
                    `Duplicate <strong>${bundleName}?</strong> A new draft will be created.`,
                destructive: false,
            };

        case "delete":
            return {
                heading:
                    modal.title || t?.("delete.heading") || "Delete Bundle",
                message:
                    modal.message ||
                    t?.("delete.message", {
                        name: `<strong>${bundleName}</strong>`,
                    }) ||
                    `Are you sure you want to delete <strong>${bundleName}</strong>? This action cannot be undone.`,
                destructive: true,
            };

        case "status": {
            const statusText = modal.newStatus
                ? (ts?.(modal.newStatus as string) ??
                  BUNDLE_STATUSES[modal.newStatus as BundleStatus]?.text ??
                  "")
                : "";
            return {
                heading:
                    modal.title ||
                    t?.("status.heading") ||
                    "Confirm Status Change",
                message:
                    modal.message ||
                    t?.("status.message", {
                        name: `<strong>${bundleName}</strong>`,
                        status: `<strong>${statusText}</strong>`,
                    }) ||
                    `Change the status of <strong>${bundleName}</strong> to <strong>${statusText}</strong>?`,
                destructive: false,
            };
        }

        case "delete-product": {
            const productName =
                modal.productTitle ||
                t?.("deleteProduct.thisProduct") ||
                "this product";
            return {
                heading:
                    modal.title ||
                    t?.("deleteProduct.heading") ||
                    "Delete bundle product?",
                message:
                    modal.message ||
                    t?.("deleteProduct.message", {
                        product: `<strong>${productName}</strong>`,
                    }) ||
                    `Turning off this switch will permanently delete <strong>${productName}</strong> from your store when you save. This action cannot be undone.`,
                destructive: true,
            };
        }

        case "restore-defaults":
            return {
                heading:
                    modal.title ||
                    t?.("restoreDefaults.heading") ||
                    "Restore defaults?",
                message:
                    modal.message ||
                    t?.("restoreDefaults.message") ||
                    "This will reset all style settings to their default values. This action cannot be undone.",
                destructive: true,
            };

        case "import-settings":
            return {
                heading:
                    modal.title ||
                    t?.("importSettings.heading") ||
                    "Import Settings?",
                message:
                    modal.message ||
                    t?.("importSettings.message") ||
                    "This will overwrite your current settings with the data from the file. This action cannot be undone.",
                destructive: true,
            };

        default:
            return {
                heading: t?.("confirmAction") ?? "Confirm Action",
                message:
                    t?.("confirmContinue") ??
                    "Are you sure you want to continue?",
                destructive: false,
            };
    }
};
