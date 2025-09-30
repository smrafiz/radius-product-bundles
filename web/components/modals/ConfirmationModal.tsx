"use client";

import { Modal, Text } from "@shopify/polaris";

interface Props {
    open: boolean;
    title: string;
    message: React.ReactNode;
    loading?: boolean;
    destructive?: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmationModal({
    open,
    title,
    message,
    loading,
    destructive,
    onClose,
    onConfirm,
}: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            primaryAction={{
                content: "Confirm",
                destructive,
                loading,
                onAction: onConfirm,
            }}
            secondaryActions={[{ content: "Cancel", onAction: onClose }]}
        >
            <Modal.Section>
                <Text as="p" variant="bodyMd">
                    {message}
                </Text>
            </Modal.Section>
        </Modal>
    );
}
