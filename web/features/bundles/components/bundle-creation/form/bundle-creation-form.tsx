"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    StepContent,
    useBundleCreationForm,
} from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import { GlobalBanner } from "@/shared";

/**
 * Bundle Creation Form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
    bundleId,
}: BundleCreationFormProps) {
    const {
        tc,
        tEmbed,
        tWidget,
        tBoth,
        bundleData,
        pageProps,
        isEditMode,
        isSaving,
        isDirty,
        isDeleting,
        isDuplicating,
        isCheckingStatus,
        statusIssue,
        statusBannerRef,
        shopDomain,
        apiKey,
        handleCheckStatus,
        handleDuplicate,
        handleDelete,
        handleSubmit,
    } = useBundleCreationForm({ bundleType, bundleName, bundleId });

    return (
        <s-page heading={isEditMode ? tc("edit") : tc("create")}>
            <TitleBar title={isEditMode ? tc("edit") : tc("create")}>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    {tc("breadcrumb")}
                </button>

                {isSaving || isDeleting || isDuplicating ? (
                    <>
                        <s-button
                            variant="primary"
                            disabled={isSaving || (isEditMode && !isDirty)}
                            loading={isSaving}
                        >
                            {isEditMode ? tc("update") : tc("publish")}
                        </s-button>
                        {isEditMode && bundleId && (
                            <s-button
                                disabled={isDuplicating}
                                loading={isDuplicating}
                            >
                                {tc("duplicate")}
                            </s-button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!isDirty}
                        >
                            {isEditMode ? tc("update") : tc("publish")}
                        </button>
                        {isEditMode && bundleId && (
                            <button onClick={handleDuplicate}>
                                {tc("duplicate")}
                            </button>
                        )}
                    </>
                )}
            </TitleBar>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {/* Header */}
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={pageProps.onBack()}
                            icon="arrow-left"
                            accessibilityLabel={tc("back")}
                        />
                    </s-stack>

                    <div className="flex-1 flex items-center justify-between">
                        <s-stack
                            direction="inline"
                            gap="base"
                            alignItems="center"
                        >
                            <s-heading>
                                <div className="text-xl">{pageProps.title}</div>
                            </s-heading>

                            {isEditMode && (
                                <s-badge tone="neutral">
                                    {pageProps.badgeLabel}
                                </s-badge>
                            )}
                        </s-stack>

                        {isEditMode && bundleId && (
                            <s-stack direction="inline" gap="small">
                                <s-button
                                    variant="secondary"
                                    icon="info"
                                    onClick={handleCheckStatus}
                                    loading={isCheckingStatus}
                                    disabled={!!statusIssue}
                                    accessibilityLabel={tc("checkStatus")}
                                >
                                    {tc("checkStatus")}
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    tone="critical"
                                    icon="delete"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                    accessibilityLabel={tc("deleteBundle")}
                                >
                                    {tc("deleteBundle")}
                                </s-button>
                            </s-stack>
                        )}
                    </div>
                </s-stack>

                {/* Integration status banner */}
                {statusIssue && (
                    <s-banner
                        ref={statusBannerRef}
                        tone="warning"
                        heading={
                            statusIssue.embedMissing && statusIssue.blockMissing
                                ? tBoth("setupIncomplete")
                                : statusIssue.embedMissing
                                  ? tEmbed("notEnabled")
                                  : tWidget("notAdded")
                        }
                        dismissible
                    >
                        <s-paragraph>
                            {statusIssue.embedMissing && statusIssue.blockMissing
                                ? tBoth("bothMissingDesc")
                                : statusIssue.embedMissing
                                  ? tEmbed("notEnabledDesc")
                                  : tWidget("notAddedDesc")}
                        </s-paragraph>
                        {statusIssue.embedMissing && (
                            <s-button
                                slot="secondary-actions"
                                variant="secondary"
                                onClick={() =>
                                    window.open(
                                        `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`,
                                        "_blank",
                                    )
                                }
                            >
                                {statusIssue.blockMissing
                                    ? tBoth("enableEmbed")
                                    : tEmbed("enableButton")}
                            </s-button>
                        )}
                        {statusIssue.blockMissing && (
                            <s-button
                                slot="secondary-actions"
                                variant="secondary"
                                onClick={() =>
                                    window.open(
                                        `https://${shopDomain}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/app-block&target=newAppsSection`,
                                        "_blank",
                                    )
                                }
                            >
                                {statusIssue.embedMissing
                                    ? tBoth("addWidget")
                                    : tWidget("addButton")}
                            </s-button>
                        )}
                    </s-banner>
                )}

                {/* Content */}
                <s-stack gap="base">
                    <GlobalBanner />
                    <HorizontalStepIndicator />

                    <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left column */}
                            <div className="md:col-span-7">
                                <StepContent bundleType={bundleType} />
                            </div>

                            {/* Right column */}
                            <div className="md:col-span-5">
                                <div className="sticky top-4">
                                    <BundlePreview />
                                </div>
                            </div>
                        </div>
                    </div>
                </s-stack>
            </s-stack>
        </s-page>
    );
}
