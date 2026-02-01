import {
    useSettingsStore,
    useSettingsTools
} from "@/features/settings";

/**
 * Tools settings component
 */
export function SettingsTools() {
    const {
        isSyncing,
        isResetting,
        isClearing,
        syncMetafields,
        resetApp,
        clearWidgetCache,
    } = useSettingsStore();

    const {
        isExporting,
        isImporting,
        handleExport,
        triggerImport,
        onFileSelected,
        fileInputRef
    } = useSettingsTools();

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
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".json"
                            onChange={onFileSelected}
                        />
                        <s-button
                            variant="secondary"
                            icon="upload"
                            onClick={triggerImport}
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
                            onClick={syncMetafields}
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
                            onClick={clearWidgetCache}
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
                    onClick={resetApp}
                    loading={isResetting}
                >
                    Reset all settings
                </s-button>
            </s-modal>
        </s-stack>
    );
}
