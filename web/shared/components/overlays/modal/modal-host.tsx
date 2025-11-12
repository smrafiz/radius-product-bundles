"use client";

import { useModalStore } from "@/shared";

export function ModalHost() {
    const { modal, closeModal, setLoading, setError } = useModalStore();

    // Nothing open → render nothing
    if (!modal || modal.type === null) {
        return null;
    }

    const handleConfirm = async () => {
        if (!modal.onConfirm) return;

        try {
            setError(null);
            setLoading(true);
            await modal.onConfirm();
            closeModal();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "An unexpected error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Modal ID matches the modal type
    const modalId = modal.type;

    return (
        <>
            {/* ✅ Web Component Modal */}
            <s-modal id={modalId} heading={modal.title || "Confirm Action"}>
                {modal.error && (
                    <s-banner tone="critical">
                        <s-text>{modal.error}</s-text>
                    </s-banner>
                )}

                <s-paragraph>
                    {modal.message || "Are you sure you want to continue?"}
                </s-paragraph>

                {/* Secondary Action (Close) */}
                <s-button
                    slot="secondary-actions"
                    commandFor={modalId}
                    command="--hide"
                    onClick={closeModal}
                >
                    Cancel
                </s-button>

                {/* Primary Action (Confirm) */}
                <s-button
                    slot="primary-action"
                    variant={modal.destructive ? "destructive" : "primary"}
                    commandFor={modalId}
                    command="--hide"
                    onClick={handleConfirm}
                    loading={modal.loading}
                >
                    {modal.loading ? "Processing..." : "Confirm"}
                </s-button>
            </s-modal>
        </>
    );
}