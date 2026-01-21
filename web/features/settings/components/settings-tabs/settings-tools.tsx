"use client";

import { useState } from "react";

/**
 * Tools settings component
 */
export function SettingsTools() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    /**
     * Handles exporting settings to JSON file
     */
    async function handleExport() {
        setIsExporting(true);
        try {
            // TODO: Implement export logic
            console.log("Exporting settings...");
        } finally {
            setIsExporting(false);
        }
    }

    /**
     * Handles importing settings from JSON file
     */
    async function handleImport() {
        setIsImporting(true);
        try {
            // TODO: Implement import logic
            console.log("Importing settings...");
        } finally {
            setIsImporting(false);
        }
    }

    /**
     * Handles syncing metafields to Shopify
     */
    async function handleSync() {
        setIsSyncing(true);
        try {
            // TODO: Implement sync logic
            console.log("Syncing to Shopify...");
        } finally {
            setIsSyncing(false);
        }
    }

    /**
     * Handles clearing widget cache
     */
    async function handleClearCache() {
        setIsClearing(true);
        try {
            // TODO: Implement clear cache logic
            console.log("Clearing cache...");
        } finally {
            setIsClearing(false);
        }
    }

    /**
     * Handles resetting all settings to defaults
     */
    async function handleReset() {
        setIsResetting(true);
        try {
            // TODO: Implement reset logic
            console.log("Resetting settings...");
        } finally {
            setIsResetting(false);
        }
    }

    return (
        <s-stack gap="large">
            {/* Data Management Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Data Management</s-heading>
                        <s-tooltip id="data-management-tooltip">
                            <s-text>Export or import your app settings.</s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="data-management-tooltip"
                        />
                    </s-stack>

                    {/* Export Settings */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Export settings</s-heading>
                            <s-paragraph color="subdued">
                                Download a backup of all your current settings.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="download"
                            onClick={handleExport}
                            loading={isExporting}
                        >
                            Export
                        </s-button>
                    </s-stack>

                    <s-divider />

                    {/* Import Settings */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Import settings</s-heading>
                            <s-paragraph color="subdued">
                                Restore settings from a previously exported JSON
                                file.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="upload"
                            onClick={handleImport}
                            loading={isImporting}
                        >
                            Import
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Sync & Cache Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Sync & Cache</s-heading>
                        <s-tooltip id="sync-cache-tooltip">
                            <s-text>
                                Manually sync data or clear cache if you
                                experience issues.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="sync-cache-tooltip"
                        />
                    </s-stack>

                    {/* Sync to Shopify */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Sync to Shopify</s-heading>
                            <s-paragraph color="subdued">
                                Force sync all settings and bundle data to
                                Shopify metafields.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="refresh"
                            onClick={handleSync}
                            loading={isSyncing}
                        >
                            Sync
                        </s-button>
                    </s-stack>

                    <s-divider />

                    {/* Clear Cache */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Clear cache</s-heading>
                            <s-paragraph color="subdued">
                                Clear cached widget data. Use if changes are not
                                appearing on your store.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="delete"
                            onClick={handleClearCache}
                            loading={isClearing}
                        >
                            Clear
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Danger Zone Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-text tone="critical">
                            <s-heading>Danger Zone</s-heading>
                        </s-text>
                        <s-tooltip id="danger-zone-tooltip">
                            <s-text>
                                Destructive actions that cannot be undone.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="danger-zone-tooltip"
                        />
                    </s-stack>

                    {/* Reset Settings */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Reset app settings</s-heading>
                            <s-paragraph color="subdued">
                                Reset all settings to their default values. This
                                action cannot be undone.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            tone="critical"
                            variant="secondary"
                            icon="undo"
                            command="--show"
                            commandFor="reset-confirm-modal"
                        >
                            Reset
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Reset Confirmation Modal */}
            <s-modal id="reset-confirm-modal" heading="Reset all settings?">
                <s-stack gap="base">
                    <s-text>
                        This will reset all your settings to their default
                        values. Your bundles will not be affected, but all
                        customizations to colors, labels, and other settings
                        will be lost.
                    </s-text>
                    <s-text type="strong">This action cannot be undone.</s-text>
                </s-stack>

                <s-button
                    slot="secondary-actions"
                    command="--hide"
                    commandFor="reset-confirm-modal"
                >
                    Cancel
                </s-button>

                <s-button
                    slot="primary-action"
                    onClick={handleReset}
                    loading={isResetting}
                >
                    Reset all settings
                </s-button>
            </s-modal>
        </s-stack>
    );
}
