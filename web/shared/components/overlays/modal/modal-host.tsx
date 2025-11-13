"use client";

import { useModalStore } from "@/shared";
import { BUNDLE_STATUSES, BundleStatus } from "@/features/bundles";

/**
 * Modal Host - Single Reusable Modal
 */
export function ModalHost() {
    const { modal, closeModal, setLoading, setError } = useModalStore();

    const handleConfirm = async () => {
        if (!modal || modal.type === null || !('onConfirm' in modal)) {
            return;
        }

        try {
            setError(null);
            setLoading(true);

            await modal.onConfirm?.();
            closeModal();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Get modal content based on type
    const getModalContent = () => {
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
                    message: modal.message || (
                        <>
                            Duplicate <strong>{modal.bundle?.name}</strong>? A new draft
                            will be created.
                        </>
                    ),
                    destructive: false,
                };

            case "delete":
                return {
                    heading: modal.title || "Delete Bundle",
                    message: modal.message || (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{modal.bundle?.name}</strong>? This action cannot be
                            undone.
                        </>
                    ),
                    destructive: true,
                };

            case "status":
                return {
                    heading: modal.title || "Confirm Status Change",
                    message: modal.message || (
                        <>
                            Change status of <strong>{modal.bundle?.name}</strong> to{" "}
                            <strong>
                                {modal.newStatus
                                    ? BUNDLE_STATUSES[modal.newStatus as BundleStatus]
                                        ?.text
                                    : ""}
                            </strong>
                            ?
                        </>
                    ),
                    destructive: false,
                };

            default:
                return {
                    heading: "Confirm Action",
                    message: "Are you sure you want to continue?",
                    destructive: false,
                };
        }
    };

    const { heading, message, destructive } = getModalContent();
    const hasActiveModal = modal && modal.type !== null;

    // Always render the modal
    return (
        <s-modal id="app-modal" heading={heading}>
            {hasActiveModal && modal.error && (
                <s-banner tone="critical">
                    <s-text>{modal.error}</s-text>
                </s-banner>
            )}

            <s-text>{message}</s-text>

            {/* Secondary Action (Close) */}
            <s-button
                slot="secondary-actions"
                variant="secondary"
                commandFor="app-modal"
                command="--hide"
                onClick={closeModal}
            >
                Cancel
            </s-button>

            {/* Primary Action (Confirm) */}
            <s-button
                slot="primary-action"
                variant="primary"
                tone={destructive ? "critical" : undefined}
                commandFor="app-modal"
                command="--hide"
                onClick={handleConfirm}
                loading={hasActiveModal && modal.loading}
            >
                {hasActiveModal && modal.loading ? "Processing..." : "Confirm"}
            </s-button>
        </s-modal>
    );
}