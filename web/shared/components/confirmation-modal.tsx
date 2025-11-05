"use client";

import { ConfirmationModalProps } from "@/shared";
import { Banner, BlockStack, Modal, Text } from "@shopify/polaris";

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
