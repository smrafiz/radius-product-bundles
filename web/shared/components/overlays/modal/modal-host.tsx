"use client";

import { ReactNode } from "react";
import { MODAL_CONTENT, useModalStore } from "@/shared";

/**
 * Modal Host - Single Reusable Modal
 */
export function ModalHost() {
    const { modal, closeModal, setLoading, setError } = useModalStore();

    const handleConfirm = async () => {
        if (!modal || modal.type === null || !("onConfirm" in modal)) {
            return;
        }

        try {
            setError(null);
            setLoading(true);

            await modal.onConfirm?.();

            const modalElement = document.getElementById(
                "radius-bundles-app-modal",
            ) as any;
            if (modalElement?.hideOverlay) {
                modalElement.hideOverlay();
            }

            setTimeout(() => {
                closeModal();
            }, 300);
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

    const { heading, message, destructive } = MODAL_CONTENT(modal);
    const hasActiveModal = modal && modal.type !== null;

    const renderMessage = (message: ReactNode) => {
        if (typeof message !== "string") {
            return message;
        }

        const parts = message.split(/(<strong>|<\/strong>)/g);

        return parts.map((part, index) => {
            if (part === "<strong>" || part === "</strong>") {
                return null;
            }

            const isStrong = parts[index - 1] === "<strong>";
            return isStrong ? (
                <s-text key={index} type="strong">
                    {part}
                </s-text>
            ) : (
                <s-text key={index}>{part}</s-text>
            );
        });
    };

    // Always render the modal
    return (
        <s-modal id="radius-bundles-app-modal" accessibilityLabel="bundle app modal" heading={heading}>
            {hasActiveModal && modal.error && (
                <s-banner tone="critical">
                    <s-text>{modal.error}</s-text>
                </s-banner>
            )}

            <s-text>{renderMessage(message)}</s-text>

            {/* Secondary Action (Close) */}
            <s-button
                slot="secondary-actions"
                variant="secondary"
                commandFor="radius-bundles-app-modal"
                command="--hide"
                onClick={closeModal}
                disabled={hasActiveModal && modal.loading}
            >
                Cancel
            </s-button>

            {/* Primary Action (Confirm) */}
            <s-button
                slot="primary-action"
                variant="primary"
                tone={destructive ? "critical" : undefined}
                onClick={handleConfirm}
                loading={hasActiveModal && modal.loading}
                disabled={hasActiveModal && modal.loading}
            >
                {destructive ? "Delete" : "Confirm"}
            </s-button>
        </s-modal>
    );
}
