"use client";

import { useState } from "react";
import { Modal, Text } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

import { BundleListItem } from "@/types";
import { duplicateBundle } from "@/actions";
import { useBundleListingStore } from "@/stores";

interface Props {
    open: boolean;
    bundle: BundleListItem | null;
    onClose: () => void;
    onSuccess: (newBundleId: string, newBundleName: string) => void;
    onError: (error: string) => void;
}

export default function DuplicateBundleModal({
    open,
    bundle,
    onClose,
    onSuccess,
    onError,
}: Props) {
    const [isDuplicating, setIsDuplicating] = useState(false);
    const app = useAppBridge();

    const handleDuplicate = async () => {
        if (!bundle) return;

        setIsDuplicating(true);

        try {
            const token = await app.idToken();
            const result = await duplicateBundle(token, bundle.id);

            if (result.status === "success") {
                onSuccess(result.data.id, result.data.name);
                onClose();
            } else {
                onError(result.message || "Failed to duplicate bundle");
            }
        } catch (error) {
            console.error("Error duplicating bundle:", error);
            onError("Failed to duplicate bundle");
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Duplicate Bundle"
            primaryAction={{
                content: "Duplicate Bundle",
                loading: isDuplicating,
                onAction: handleDuplicate,
            }}
            secondaryActions={[
                {
                    content: "Cancel",
                    onAction: onClose,
                    disabled: isDuplicating,
                },
            ]}
        >
            <Modal.Section>
                <Text as="p" variant="bodyMd">
                    Are you sure you want to duplicate{" "}
                    <strong>"{bundle?.name}"</strong>? This will create a new
                    bundle with all the same settings as a draft.
                </Text>
            </Modal.Section>
        </Modal>
    );
}
