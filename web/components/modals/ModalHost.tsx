"use client";

import { useModalStore } from "@/stores";
import { bundleStatusConfigs } from "@/config";
import { ConfirmationModal } from "@/components";

export function ModalHost() {
    const { open, type, payload, closeModal } = useModalStore();

    if (!open || !type) return null;

    switch (type) {
        case "delete":
            return (
                <ConfirmationModal
                    open
                    title="Delete Bundle"
                    message={
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{payload?.bundle?.name}</strong>? This action cannot be undone.
                        </>
                    }
                    destructive
                    onClose={closeModal}
                    onConfirm={payload?.onConfirm || closeModal}
                />
            );

        case "duplicate":
            return (
                <ConfirmationModal
                    open
                    title="Duplicate Bundle"
                    message={
                        <>
                            Duplicate <strong>{payload?.bundle?.name}</strong>? A new draft will be created.
                        </>
                    }
                    onClose={closeModal}
                    onConfirm={payload?.onConfirm || closeModal}
                />
            );

        case "status":
            return (
                <ConfirmationModal
                    open
                    title="Confirm Status Change"
                    message={
                        <>
                            Change status of <strong>{payload?.bundle?.name}</strong> to{" "}
                            <strong>
                                {payload?.newStatus
                                    ? bundleStatusConfigs[payload.newStatus].text
                                    : ""}
                            </strong>
                            ?
                        </>
                    }
                    onClose={closeModal}
                    onConfirm={payload?.onConfirm || closeModal}
                />
            );

        default:
            return null;
    }
}