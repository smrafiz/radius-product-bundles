"use client";

import {
    downloadSettingsFile,
    readSettingsFile,
    SyncMetafieldResult,
    useRefetchSettings,
    useSettingsStore,
    WebhookCheckResult,
    WebhookRegisterResult,
} from "@/features/settings";
import { useRef, useState } from "react";
import { useModalStore } from "@/shared";
import {
    checkWebhooksAction,
    forceRegisterWebhooksAction,
    syncMetafieldsAction,
} from "@/features/settings/actions/tools.action";
import {
    getSettingsAction,
    saveSettingsAction,
} from "@/features/settings/actions/settings.action";
import { useAppBridge } from "@shopify/app-bridge-react";

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
        setSyncing,
        isCheckingWebhooks,
        setCheckingWebhooks,
        isRegisteringWebhooks,
        setRegisteringWebhooks,
    } = useSettingsStore();

    const [syncResult, setSyncResult] = useState<SyncMetafieldResult | null>(
        null,
    );
    const [webhookCheckResult, setWebhookCheckResult] =
        useState<WebhookCheckResult | null>(null);
    const [webhookRegisterResult, setWebhookRegisterResult] =
        useState<WebhookRegisterResult | null>(null);

    const syncModalTriggerRef = useRef<any>(null);
    const webhookCheckModalTriggerRef = useRef<any>(null);
    const webhookRegisterModalTriggerRef = useRef<any>(null);

    function triggerImport() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

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
                            { duration: 3000 },
                        );
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
                }
            },
        });
    };

    async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = "";
        handleImport(file);
    }

    const handleSyncMetafields = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const token = await app.idToken();
            const result = await syncMetafieldsAction(token);

            if (result.status === "error") {
                window.shopify?.toast?.show(result.message || "Sync failed", {
                    duration: 5000,
                    isError: true,
                });
                return;
            }

            setSyncResult(result.data ?? null);
            syncModalTriggerRef.current?.click();
        } catch (error) {
            console.error("Sync error:", error);
            window.shopify?.toast?.show("An unexpected error occurred", {
                duration: 5000,
                isError: true,
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleCheckWebhooks = async () => {
        setCheckingWebhooks(true);
        setWebhookCheckResult(null);
        try {
            const token = await app.idToken();
            const result = await checkWebhooksAction(token);

            if (result.status === "error") {
                window.shopify?.toast?.show(
                    result.message || "Failed to check webhooks",
                    { duration: 5000, isError: true },
                );
                return;
            }

            setWebhookCheckResult(result.data ?? null);
            webhookCheckModalTriggerRef.current?.click();
        } catch (error) {
            console.error("Webhook check error:", error);
            window.shopify?.toast?.show("An unexpected error occurred", {
                duration: 5000,
                isError: true,
            });
        } finally {
            setCheckingWebhooks(false);
        }
    };

    const handleForceRegister = async () => {
        setRegisteringWebhooks(true);
        setWebhookRegisterResult(null);
        try {
            const token = await app.idToken();
            const result = await forceRegisterWebhooksAction(token);

            if (result.status === "error") {
                window.shopify?.toast?.show(
                    result.message || "Failed to register webhooks",
                    { duration: 5000, isError: true },
                );
                return;
            }

            setWebhookRegisterResult(result.data ?? null);
            webhookRegisterModalTriggerRef.current?.click();
        } catch (error) {
            console.error("Webhook register error:", error);
            window.shopify?.toast?.show("An unexpected error occurred", {
                duration: 5000,
                isError: true,
            });
        } finally {
            setRegisteringWebhooks(false);
        }
    };

    return {
        isExporting,
        isImporting,
        isSyncing,
        isCheckingWebhooks,
        isRegisteringWebhooks,

        handleExport,
        handleImport,
        triggerImport,
        onFileSelected,
        handleSyncMetafields,
        handleCheckWebhooks,
        handleForceRegister,

        syncResult,
        webhookCheckResult,
        webhookRegisterResult,

        syncModalTriggerRef,
        webhookCheckModalTriggerRef,
        webhookRegisterModalTriggerRef,

        fileInputRef,
    };
}
