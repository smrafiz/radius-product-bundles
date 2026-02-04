import { useSettingsStore, useSettingsTools } from "@/features/settings";

export function SettingsTools() {
    const { isResetting, resetApp } = useSettingsStore();

    const {
        isExporting,
        isImporting,
        isSyncing,
        isClearing,
        isCheckingWebhooks,
        isRegisteringWebhooks,
        handleExport,
        triggerImport,
        onFileSelected,
        handleSyncMetafields,
        handleClearCache,
        handleCheckWebhooks,
        handleForceRegister,
        syncResult,
        webhookCheckResult,
        webhookRegisterResult,
        syncModalTriggerRef,
        webhookCheckModalTriggerRef,
        webhookRegisterModalTriggerRef,
        fileInputRef,
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
                            onClick={handleSyncMetafields}
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
                            <s-heading>Clear app cache</s-heading>
                            <s-paragraph color="subdued">
                                Clear all cached data including bundles, analytics,
                                and settings
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

            {/* Webhook Management Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Webhook Management</s-heading>
                        <s-tooltip id="webhook-management-tooltip">
                            <s-text>
                                Check or re-register webhook subscriptions with
                                Shopify from Radius product bundles app.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="webhook-management-tooltip"
                        />
                    </s-stack>

                    {/* Check Webhooks */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Check webhooks</s-heading>
                            <s-paragraph color="subdued">
                                View all currently registered webhook
                                subscriptions from Radius product bundles app.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="search"
                            onClick={handleCheckWebhooks}
                            loading={isCheckingWebhooks}
                        >
                            Check
                        </s-button>
                    </s-stack>

                    <s-divider />

                    {/* Force Register Webhooks */}
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-heading>Force register webhooks</s-heading>
                            <s-paragraph color="subdued">
                                Reset and re-register all webhooks with Shopify.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="refresh"
                            onClick={handleForceRegister}
                            loading={isRegisteringWebhooks}
                        >
                            Register
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

            {/* Hidden modal triggers — s-modal opens via s-button commandFor click */}
            <div style={{ display: "none" }}>
                <s-button
                    ref={syncModalTriggerRef}
                    commandFor="sync-result-modal"
                />
                <s-button
                    ref={webhookCheckModalTriggerRef}
                    commandFor="webhook-check-modal"
                />
                <s-button
                    ref={webhookRegisterModalTriggerRef}
                    commandFor="webhook-register-modal"
                />
            </div>

            {/* Sync Result Modal */}
            <s-modal id="sync-result-modal" heading="Metafield Sync Results">
                {syncResult ? (
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-heading>Status</s-heading>
                            <s-badge
                                tone={
                                    syncResult.success ? "success" : "critical"
                                }
                            >
                                {syncResult.success
                                    ? "Sync complete"
                                    : "Sync failed"}
                            </s-badge>
                        </s-stack>

                        <s-divider />

                        {syncResult.success ? (
                            <>
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="start"
                                >
                                    <s-heading>Synced</s-heading>
                                    <s-stack gap="small-200" alignItems="end">
                                        {syncResult.syncedItems.map((item) => (
                                            <s-text key={item}>{item}</s-text>
                                        ))}
                                    </s-stack>
                                </s-stack>
                            </>
                        ) : (
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <s-heading>Error</s-heading>
                                <s-text>
                                    {syncResult.error ||
                                        "An unknown error occurred"}
                                </s-text>
                            </s-stack>
                        )}
                    </s-stack>
                ) : (
                    <s-text color="subdued">No results yet.</s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="sync-result-modal"
                >
                    Close
                </s-button>
            </s-modal>

            {/* Webhook Check Modal */}
            <s-modal id="webhook-check-modal" heading="Registered Webhooks">
                {webhookCheckResult ? (
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-heading>Status</s-heading>
                            {webhookCheckResult.missingTopics.length === 0 ? (
                                <s-badge tone="success">
                                    All webhooks registered
                                </s-badge>
                            ) : (
                                <s-badge tone="warning">
                                    {webhookCheckResult.missingTopics.length}{" "}
                                    missing webhook(s)
                                </s-badge>
                            )}
                        </s-stack>

                        <s-divider />

                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="start"
                        >
                            <s-heading>
                                Registered ({webhookCheckResult.totalCount})
                            </s-heading>
                            <s-stack
                                gap="small-200"
                                alignItems="end"
                                direction="inline"
                            >
                                {webhookCheckResult.webhooks.map((wh) => (
                                    <s-stack key={wh.id} gap="small-100">
                                        <s-badge key={wh.topic} tone="success">
                                            {wh.topic}
                                        </s-badge>
                                    </s-stack>
                                ))}
                            </s-stack>
                        </s-stack>

                        {webhookCheckResult.missingTopics.length > 0 && (
                            <>
                                <s-divider />
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="start"
                                >
                                    <s-heading>Missing</s-heading>
                                    <s-stack
                                        gap="small-200"
                                        alignItems="end"
                                        direction="inline"
                                    >
                                        {webhookCheckResult.missingTopics.map(
                                            (topic) => (
                                                <s-badge
                                                    key={topic}
                                                    tone="warning"
                                                >
                                                    {topic}
                                                </s-badge>
                                            ),
                                        )}
                                    </s-stack>
                                </s-stack>
                            </>
                        )}

                        <s-divider />

                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="start"
                        >
                            <s-stack gap="small-200">
                                <s-heading>
                                    GDPR (
                                    {webhookCheckResult.gdprTopics.length})
                                </s-heading>
                            </s-stack>
                            <s-stack
                                gap="small-200"
                                alignItems="end"
                                direction="inline"
                            >
                                {webhookCheckResult.gdprTopics.map((topic) => (
                                    <s-badge key={topic} tone="info">
                                        {topic}
                                    </s-badge>
                                ))}
                            </s-stack>
                        </s-stack>
                    </s-stack>
                ) : (
                    <s-text color="subdued">No results yet.</s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="webhook-check-modal"
                >
                    Close
                </s-button>
            </s-modal>

            {/* Webhook Register Modal */}
            <s-modal
                id="webhook-register-modal"
                heading="Webhook Registration Results"
            >
                {webhookRegisterResult ? (
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-heading>Status</s-heading>
                            <s-badge
                                tone={
                                    webhookRegisterResult.success
                                        ? "success"
                                        : webhookRegisterResult.failed.length >
                                            0
                                          ? "warning"
                                          : "critical"
                                }
                            >
                                {webhookRegisterResult.success
                                    ? "All registered successfully"
                                    : webhookRegisterResult.failed.length > 0
                                      ? "Partial success"
                                      : "Registration failed"}
                            </s-badge>
                        </s-stack>

                        {webhookRegisterResult.registered.length > 0 && (
                            <>
                                <s-divider />
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="start"
                                >
                                    <s-heading>Registered</s-heading>
                                    <s-stack gap="small-200" alignItems="end" direction="inline">
                                        {webhookRegisterResult.registered.map(
                                            (topic) => (
                                                <s-badge
                                                    key={topic}
                                                    tone="success"
                                                >
                                                    {topic}
                                                </s-badge>
                                            ),
                                        )}
                                    </s-stack>
                                </s-stack>
                            </>
                        )}

                        {webhookRegisterResult.failed.length > 0 && (
                            <>
                                <s-divider />
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="start"
                                >
                                    <s-heading>Failed</s-heading>
                                    <s-stack gap="small-200" alignItems="end">
                                        {webhookRegisterResult.failed.map(
                                            (f, i) => (
                                                <s-stack
                                                    key={i}
                                                    gap="small-100"
                                                    alignItems="end"
                                                >
                                                    <s-badge tone="critical">
                                                        {f.topic}
                                                    </s-badge>
                                                    <s-text color="subdued">
                                                        {f.error}
                                                    </s-text>
                                                </s-stack>
                                            ),
                                        )}
                                    </s-stack>
                                </s-stack>
                            </>
                        )}
                    </s-stack>
                ) : (
                    <s-text color="subdued">No results yet.</s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="webhook-register-modal"
                >
                    Close
                </s-button>
            </s-modal>
        </s-stack>
    );
}
