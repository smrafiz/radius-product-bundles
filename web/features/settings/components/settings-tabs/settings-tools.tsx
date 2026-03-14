import { useSettingsTools } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

export function SettingsTools() {
    const t = useTranslations("Settings.Tools");
    const {
        isExporting,
        isImporting,
        isSyncing,
        isClearing,
        isResetting,
        isCheckingWebhooks,
        isRegisteringWebhooks,
        handleExport,
        triggerImport,
        onFileSelected,
        handleSyncMetafields,
        handleClearCache,
        handleResetSettings,
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
                        <s-heading>{t("dataManagement.title")}</s-heading>
                        <s-tooltip id="data-management-tooltip">
                            <s-text>{t("dataManagement.description")}</s-text>
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
                            <s-heading>{t("dataManagement.export.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("dataManagement.export.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="download"
                            onClick={handleExport}
                            loading={isExporting}
                        >
                            {t("dataManagement.export.button")}
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
                            <s-heading>{t("dataManagement.import.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("dataManagement.import.description")}
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
                            {t("dataManagement.import.button")}
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
                        <s-heading>{t("syncCache.title")}</s-heading>
                        <s-tooltip id="sync-cache-tooltip">
                            <s-text>
                                {t("syncCache.description")}
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
                            <s-heading>{t("syncCache.sync.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("syncCache.sync.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="refresh"
                            onClick={handleSyncMetafields}
                            loading={isSyncing}
                        >
                            {t("syncCache.sync.button")}
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
                            <s-heading>{t("syncCache.clearCache.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("syncCache.clearCache.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="delete"
                            onClick={handleClearCache}
                            loading={isClearing}
                        >
                            {t("syncCache.clearCache.button")}
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
                        <s-heading>{t("webhookManagement.title")}</s-heading>
                        <s-tooltip id="webhook-management-tooltip">
                            <s-text>
                                {t("webhookManagement.description")}
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
                            <s-heading>{t("webhookManagement.check.title")}</s-heading>
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
                            {t("webhookManagement.check.button")}
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
                            <s-heading>{t("webhookManagement.register.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("webhookManagement.register.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="refresh"
                            onClick={handleForceRegister}
                            loading={isRegisteringWebhooks}
                        >
                            {t("webhookManagement.register.button")}
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
                            <s-heading>{t("dangerZone.title")}</s-heading>
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
                            <s-heading>{t("dangerZone.reset.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("dangerZone.reset.description")}
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
            <s-modal id="reset-confirm-modal" heading={t("resetModal.title")}>
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
                    slot="primary-action"
                    onClick={handleResetSettings}
                    tone="critical"
                    variant="primary"
                    loading={isResetting}
                >
                    {t("resetModal.confirmButton")}
                </s-button>

                <s-button
                    slot="secondary-actions"
                    command="--hide"
                    commandFor="reset-confirm-modal"
                >
                    {t("resetModal.cancelButton")}
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
            <s-modal id="sync-result-modal" heading={t("syncResultsModal.title")}>
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
                                    ? t("syncResultsModal.syncComplete")
                                    : t("syncResultsModal.syncFailed")}
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
                                        t("syncResultsModal.unknownError")}
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
            <s-modal id="webhook-check-modal" heading={t("webhookCheckModal.title")}>
                {webhookCheckResult ? (
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
                        >
                            <s-heading>Status</s-heading>
                            {webhookCheckResult.missingTopics.length === 0 ? (
                                <s-badge tone="success">
                                    {t("webhookCheckModal.allRegistered")}
                                </s-badge>
                            ) : (
                                <s-badge tone="warning">
                                    {t("webhookCheckModal.missingCount", { count: String(webhookCheckResult.missingTopics.length) })}
                                </s-badge>
                            )}
                        </s-grid>

                        <s-divider />

                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
                        >
                            <s-heading>
                                {t("webhookCheckModal.statusRegistered", { count: String(webhookCheckResult.totalCount) })}
                            </s-heading>

                            <s-grid
                                gridTemplateColumns="repeat(3, auto)"
                                gap="small-200"
                            >
                                {webhookCheckResult.webhooks.map((wh) => (
                                    <s-badge key={wh.id} tone="success">
                                        {wh.topic}
                                    </s-badge>
                                ))}
                            </s-grid>
                        </s-grid>

                        {webhookCheckResult.missingTopics.length > 0 && (
                            <>
                                <s-divider />
                                <s-grid
                                    gridTemplateColumns="1fr auto"
                                    alignItems="start"
                                    gap="large-400"
                                >
                                    <s-heading>Missing</s-heading>
                                    <s-grid
                                        gridTemplateColumns="repeat(3, auto)"
                                        gap="small"
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
                                    </s-grid>
                                </s-grid>
                            </>
                        )}

                        <s-divider />

                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
                        >
                            <s-heading>
                                {t("webhookCheckModal.statusGdpr", { count: String(webhookCheckResult.gdprTopics.length) })}
                            </s-heading>
                            <s-grid
                                gridTemplateColumns="repeat(3, auto)"
                                gap="small-200"
                            >
                                {webhookCheckResult.gdprTopics.map((topic) => (
                                    <s-badge key={topic} tone="info">
                                        {topic}
                                    </s-badge>
                                ))}
                            </s-grid>
                        </s-grid>
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
                heading={t("webhookRegisterModal.title")}
            >
                {webhookRegisterResult ? (
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
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
                                    ? t("webhookRegisterModal.allSuccess")
                                    : webhookRegisterResult.failed.length > 0
                                      ? t("webhookRegisterModal.partialSuccess")
                                      : t("webhookRegisterModal.failedTitle")}
                            </s-badge>
                        </s-grid>

                        {webhookRegisterResult.registered.length > 0 && (
                            <>
                                <s-divider />
                                <s-grid
                                    gridTemplateColumns="1fr auto"
                                    alignItems="start"
                                    gap="large-400"
                                >
                                    <s-heading>Registered</s-heading>
                                    <s-grid
                                        gridTemplateColumns="repeat(3, auto)"
                                        gap="small-200"
                                    >
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
                                    </s-grid>
                                </s-grid>
                            </>
                        )}

                        {webhookRegisterResult.failed.length > 0 && (
                            <>
                                <s-divider />
                                <s-grid
                                    gridTemplateColumns="1fr auto"
                                    alignItems="start"
                                    gap="large-400"
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
                                </s-grid>
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
