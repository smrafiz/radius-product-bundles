"use client";

import { useState } from "react";
import { Modal, Text } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

import { BundleListItem } from "@/types";
import { deleteBundle } from "@/actions";

interface Props {
    open: boolean;
    bundle: BundleListItem | null;
    onClose: () => void;
    onSuccess: (bundleName: string) => void;
    onError: (error: string) => void;
}

export default function DeleteBundleModal({
    open,
    bundle,
    onClose,
    onSuccess,
    onError,
}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const app = useAppBridge();

    const handleDelete = async () => {
        if (!bundle) return;

        setIsDeleting(true);

        try {
            const token = await app.idToken();
            const result = await deleteBundle(token, bundle.id);

            if (result.status === "success") {
                onSuccess(bundle.name);
                onClose();
            } else {
                onError(result.message || "Failed to delete bundle");
            }
        } catch (error) {
            console.error("Error deleting bundle:", error);
            onError("Failed to delete bundle");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Delete Bundle"
            primaryAction={{
                content: "Delete Bundle",
                destructive: true,
                loading: isDeleting,
                onAction: handleDelete,
            }}
            secondaryActions={[
                {
                    content: "Cancel",
                    onAction: onClose,
                    disabled: isDeleting,
                },
            ]}
        >
            <Modal.Section>
                <Text as="p" variant="bodyMd">
                    Are you sure you want to delete{" "}
                    <strong>"{bundle?.name}"</strong>? This action cannot be
                    undone and will permanently remove all bundle data,
                    analytics, and settings.
                </Text>
            </Modal.Section>
        </Modal>
    );
}
