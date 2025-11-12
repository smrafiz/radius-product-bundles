"use client";

import { ConfirmationModalProps } from "@/shared";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

export function ConfirmationModal({
    open,
    title,
    message,
    loading = false,
    destructive = false,
    error,
    onClose,
    onConfirm,
}: ConfirmationModalProps) {
    const shopify = useAppBridge();

    return (
        <>
            {/* The Modal component */}
            <Modal id="confirmation-modal" open={open}>
                {/* Title bar with actions */}
                <TitleBar title={title}>
                    <s-button
                        variant={destructive ? "primary" : "secondary"}
                        disabled={loading}
                        onClick={onConfirm}
                    >
                        {loading ? "Processing..." : "Confirm"}
                    </s-button>
                    <s-button onClick={onClose} disabled={loading}>
                        Cancel
                    </s-button>
                </TitleBar>

                {/* Modal content */}
                <s-box padding="base">
                    {error && (
                        <s-banner tone="critical" heading="Error">
                            {error}
                        </s-banner>
                    )}

                    <s-paragraph>{message}</s-paragraph>
                </s-box>
            </Modal>
        </>
    );
}
