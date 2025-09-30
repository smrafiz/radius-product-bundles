"use client";

import { useModalStore } from "@/stores";
import type { BundleStatus } from "@/types";
import { bundleStatusConfigs } from "@/config";
import { ConfirmationModal } from "@/components";

export function ModalHost() {
    const { modal, closeModal, setLoading, setError } = useModalStore();

    if (!modal || modal.type === null) {
        return null;
    }

    const handleConfirm = async () => {
        if (!modal.onConfirm) {
            return;
        }

        try {
            setError(null);
            setLoading(true);
            await modal.onConfirm();
            closeModal();
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    switch (modal.type) {
        case "delete":
            return (
                <ConfirmationModal
                    open
                    title="Delete Bundle"
                    message={
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{modal.bundle?.name}</strong>? This action
                            cannot be undone.
                        </>
                    }
                    destructive
                    loading={modal.loading}
                    onClose={closeModal}
                    onConfirm={handleConfirm}
                    error={modal.error}
                />
            );

        case "duplicate":
            return (
                <ConfirmationModal
                    open
                    title="Duplicate Bundle"
                    message={
                        <>
                            Duplicate <strong>{modal.bundle?.name}</strong>? A
                            new draft will be created.
                        </>
                    }
                    loading={modal.loading}
                    onClose={closeModal}
                    onConfirm={handleConfirm}
                    error={modal.error}
                />
            );

        case "status":
            return (
                <ConfirmationModal
                    open
                    title="Confirm Status Change"
                    message={
                        <>
                            Change status of{" "}
                            <strong>{modal.bundle?.name}</strong> to{" "}
                            <strong>
                                {modal.newStatus
                                    ? bundleStatusConfigs[
                                          modal.newStatus as BundleStatus
                                      ]?.text
                                    : ""}
                            </strong>
                            ?
                        </>
                    }
                    loading={modal.loading}
                    onClose={closeModal}
                    onConfirm={handleConfirm}
                    error={modal.error}
                />
            );

        default:
            return null;
    }
}
