"use client";

import { useRef } from "react";
import {
    downloadSettingsFile,
    readSettingsFile,
    useSettingsStore,
    useRefetchSettings,
} from "@/features/settings";
import { useModalStore } from "@/shared";
import {
    getSettingsAction,
    saveSettingsAction,
} from "@/features/settings/actions/settings.action";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Hook to manage settings tools (Export, Import, Sync, Reset, Clear)
 */
export function useSettingsTools(onImportSuccess?: () => void) {
    const app = useAppBridge();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { reset: resetSettings } = useRefetchSettings();
    const { openModal } = useModalStore();
    const {
        isExporting,
        setExporting,
        isImporting,
        isSyncing,
        isResetting,
        isClearing,
        syncMetafields,
        resetApp,
        clearWidgetCache,
    } = useSettingsStore();

    /**
     * Trigger file selection for import
     */
    function triggerImport() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    /**
     * Handles exporting settings to JSON file
     */
    const handleExport = async () => {
        setExporting(true);
        try {
            const token = await app.idToken();
            const result = await getSettingsAction(token);

            if (result.status === "error") {
                window.shopify?.toast?.show(
                    result.message || "Failed to export settings",
                    { duration: 5000, isError: true },
                );
                return;
            }

            if (!result.data) {
                window.shopify?.toast?.show("No settings found to export", {
                    duration: 3000,
                    isError: true,
                });
                return;
            }

            downloadSettingsFile(result.data);

            window.shopify?.toast?.show("Settings exported successfully", {
                duration: 3000,
            });
        } catch (error) {
            console.error("Export error:", error);
            window.shopify?.toast?.show("An unexpected error occurred", {
                duration: 5000,
                isError: true,
            });
        } finally {
            setExporting(false);
        }
    };

    /**
     * Handles settings import from file
     */
    const handleImport = (file: File) => {
        if (!file) return;

        openModal({
            type: "import-settings",
            confirmText: "Import",
            onConfirm: async () => {
                try {
                    const data = await readSettingsFile(file);
                    const token = await app.idToken();

                    const result = await saveSettingsAction(token, data);

                    if (result.status === "error") {
                        window.shopify?.toast?.show(
                            result.message || "Failed to import settings",
                            { duration: 5000, isError: true },
                        );
                    } else {
                        window.shopify?.toast?.show(
                            "Settings imported successfully",
                            {
                                duration: 3000,
                            },
                        );

                        // Reset settings to force reload with skeleton
                        await resetSettings();

                        onImportSuccess?.();
                    }
                } catch (error) {
                    console.error("Import error:", error);
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Failed to read import file";

                    window.shopify?.toast?.show(message, {
                        duration: 5000,
                        isError: true,
                    });
                    // Re-throw to ensure modal shows error if needed,
                    // though we are handling it with toast here.
                    // ModalHost implementation swallows errors if we don't throw,
                    // but it also has setError.
                    // Let's rely on Toast for consistency with other actions.
                }
            },
        });
    };

    /**
     * Handles file selection change
     */
    async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input so same file can be selected again if needed
        event.target.value = "";

        handleImport(file);
    }

    return {
        // UI States
        isExporting,
        isImporting,
        isSyncing,
        isResetting,
        isClearing,

        // Actions
        handleExport,
        handleImport,
        triggerImport,
        onFileSelected,
        syncMetafields,
        resetApp,
        clearWidgetCache,

        // Refs
        fileInputRef,
    };
}
