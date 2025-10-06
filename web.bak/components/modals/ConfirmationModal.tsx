"use client";

import { Banner, BlockStack, Modal, Text } from "@shopify/polaris";

interface Props {
    open: boolean;
    title: string;
    message: React.ReactNode;
    loading?: boolean;
    destructive?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmationModal({
    open,
    title,
    message,
    loading = false,
    destructive = false,
    error,
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
            secondaryActions={[
                { content: "Cancel", onAction: onClose, disabled: loading },
            ]}
        >
            <Modal.Section>
                <BlockStack gap="400">
                    {error && (
                        <Banner tone="critical" title="Error">
                            {error}
                        </Banner>
                    )}
                    <Text as="p" variant="bodyMd">
                        {message}
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
