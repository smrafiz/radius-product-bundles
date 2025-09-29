"use client";

import { useState } from "react";
import { Modal, Text } from "@shopify/polaris";

interface Props {
    open: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
}

export default function ConfirmationModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    destructive = false,
    onClose,
    onConfirm,
}: Props) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            primaryAction={{
                content: confirmLabel,
                loading,
                onAction: handleConfirm,
                destructive,
            }}
            secondaryActions={[
                {
                    content: "Cancel",
                    onAction: onClose,
                    disabled: loading,
                },
            ]}
        >
            <Modal.Section>
                {typeof message === "string" ? (
                    <Text as="p" variant="bodyMd">
                        {message}
                    </Text>
                ) : (
                    message
                )}
            </Modal.Section>
        </Modal>
    );
}
