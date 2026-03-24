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
                            <s-text>{t("dataManagement.tooltip")}</s-text>
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
                            <s-heading>
                                {t("dataManagement.export.title")}
                            </s-heading>
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
                            {t("dataManagement.export.action")}
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
                            <s-heading>
                                {t("dataManagement.import.title")}
                            </s-heading>
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
                            {t("dataManagement.import.action")}
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
                            <s-text>{t("syncCache.tooltip")}</s-text>
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
                            {t("syncCache.sync.action")}
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
                            <s-heading>{t("syncCache.clear.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("syncCache.clear.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="delete"
                            onClick={handleClearCache}
                            loading={isClearing}
                        >
                            {t("syncCache.clear.action")}
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
                        <s-heading>{t("webhooks.title")}</s-heading>
                        <s-tooltip id="webhook-management-tooltip">
                            <s-text>{t("webhooks.tooltip")}</s-text>
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
                            <s-heading>{t("webhooks.check.title")}</s-heading>
                            <s-paragraph color="subdued">
                                {t("webhooks.check.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="search"
                            onClick={handleCheckWebhooks}
                            loading={isCheckingWebhooks}
                        >
                            {t("webhooks.check.action")}
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
                            <s-heading>
                                {t("webhooks.register.title")}
                            </s-heading>
                            <s-paragraph color="subdued">
                                {t("webhooks.register.description")}
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            variant="secondary"
                            icon="refresh"
                            onClick={handleForceRegister}
                            loading={isRegisteringWebhooks}
                        >
                            {t("webhooks.register.action")}
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
                            <s-text>{t("dangerZone.tooltip")}</s-text>
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
                            {t("dangerZone.reset.action")}
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Reset Confirmation Modal */}
            <s-modal
                id="reset-confirm-modal"
                heading={t("modals.reset.heading")}
            >
                <s-stack gap="base">
                    <s-text>{t("modals.reset.body1")}</s-text>
                    <s-text type="strong">{t("modals.reset.body2")}</s-text>
                </s-stack>

                <s-button
                    slot="primary-action"
                    onClick={handleResetSettings}
                    tone="critical"
                    variant="primary"
                    loading={isResetting}
                >
                    {t("modals.reset.primaryAction")}
                </s-button>

                <s-button
                    slot="secondary-actions"
                    command="--hide"
                    commandFor="reset-confirm-modal"
                >
                    {t("modals.reset.cancel")}
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
            <s-modal
                id="sync-result-modal"
                heading={t("modals.syncResult.heading")}
            >
                {syncResult ? (
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-heading>
                                {t("modals.syncResult.status")}
                            </s-heading>
                            <s-badge
                                tone={
                                    syncResult.success ? "success" : "critical"
                                }
                            >
                                {syncResult.success
                                    ? t("modals.syncResult.complete")
                                    : t("modals.syncResult.failed")}
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
                                    <s-heading>
                                        {t("modals.syncResult.synced")}
                                    </s-heading>
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
                                <s-heading>
                                    {t("modals.syncResult.error")}
                                </s-heading>
                                <s-text>
                                    {syncResult.error ||
                                        t("modals.syncResult.unknownError")}
                                </s-text>
                            </s-stack>
                        )}
                    </s-stack>
                ) : (
                    <s-text color="subdued">
                        {t("modals.syncResult.noResults")}
                    </s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="sync-result-modal"
                >
                    {t("modals.syncResult.close")}
                </s-button>
            </s-modal>

            {/* Webhook Check Modal */}
            <s-modal
                id="webhook-check-modal"
                heading={t("modals.webhookCheck.heading")}
            >
                {webhookCheckResult ? (
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
                        >
                            <s-heading>
                                {t("modals.webhookCheck.status")}
                            </s-heading>
                            {webhookCheckResult.missingTopics.length === 0 ? (
                                <s-badge tone="success">
                                    {t("modals.webhookCheck.allRegistered")}
                                </s-badge>
                            ) : (
                                <s-badge tone="warning">
                                    {t("modals.webhookCheck.missingCount", {
                                        count: String(
                                            webhookCheckResult.missingTopics
                                                .length,
                                        ),
                                    })}
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
                                {t("modals.webhookCheck.registeredCount", {
                                    count: String(
                                        webhookCheckResult.totalCount,
                                    ),
                                })}
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
                                    <s-heading>
                                        {t("modals.webhookCheck.missing")}
                                    </s-heading>
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
                                {t("modals.webhookCheck.gdprCount", {
                                    count: String(
                                        webhookCheckResult.gdprTopics.length,
                                    ),
                                })}
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
                    <s-text color="subdued">
                        {t("modals.webhookCheck.noResults")}
                    </s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="webhook-check-modal"
                >
                    {t("modals.webhookCheck.close")}
                </s-button>
            </s-modal>

            {/* Webhook Register Modal */}
            <s-modal
                id="webhook-register-modal"
                heading={t("modals.webhookRegister.heading")}
            >
                {webhookRegisterResult ? (
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="start"
                            gap="large-400"
                        >
                            <s-heading>
                                {t("modals.webhookRegister.status")}
                            </s-heading>
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
                                    ? t("modals.webhookRegister.success")
                                    : webhookRegisterResult.failed.length > 0
                                      ? t("modals.webhookRegister.partial")
                                      : t(
                                            "modals.webhookRegister.failedStatus",
                                        )}
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
                                    <s-heading>
                                        {t("modals.webhookRegister.registered")}
                                    </s-heading>
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
                                    <s-heading>
                                        {t("modals.webhookRegister.failed")}
                                    </s-heading>
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
                    <s-text color="subdued">
                        {t("modals.webhookRegister.noResults")}
                    </s-text>
                )}

                <s-button
                    slot="primary-action"
                    command="--hide"
                    commandFor="webhook-register-modal"
                >
                    {t("modals.webhookRegister.close")}
                </s-button>
            </s-modal>
        </s-stack>
    );
}
