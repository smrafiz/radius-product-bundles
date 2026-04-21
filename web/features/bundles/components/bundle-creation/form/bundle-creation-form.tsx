"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    StepContent,
    useBundleCreationForm,
} from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import {
    formatRelativeDate,
    GlobalBanner,
    useNavigationActions,
    usePlan,
} from "@/shared";
import { WidgetStatusBanner } from "@/features/dashboard";

/**
 * Bundle Creation Form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
    bundleId,
    updatedAt,
}: BundleCreationFormProps) {
    const {
        tc,
        tActions,
        bundleData,
        pageProps,
        isEditMode,
        isSaving,
        isDirty,
        isDeleting,
        isDuplicating,
        isCheckingStatus,
        viewPopoverId,
        overflowMenuId,
        uniqueProducts,
        mainProductUrl,
        mainProductTitle,
        myshopifyDomain,
        shopDomain,
        apiKey,
        handleCheckStatus,
        handleDuplicate,
        handleDelete,
        handleSubmit,
    } = useBundleCreationForm({ bundleType, bundleName, bundleId });
    const { canUse } = usePlan();
    const canDuplicate = canUse("duplicate_bundle");
    const { actions: navActions, isLoading: isNavLoading } =
        useNavigationActions({ createNew: bundleData.create() });
    const isCreatingNew = isNavLoading("createNew");
    const duplicateLabel = canDuplicate
        ? tc("duplicate")
        : `${tc("duplicate")} (Pro)`;

    return (
        <s-page heading={isEditMode ? tc("edit") : tc("create")}>
            <TitleBar title={isEditMode ? tc("edit") : tc("create")}>
                {/*
                 * `variant` on these <button> elements is intentional and not a
                 * standard HTML attribute. App Bridge React's <TitleBar> scans its
                 * children and reads the `variant` prop to determine button placement
                 * and styling inside the Shopify Admin chrome (breadcrumb, primary, etc.).
                 * These are processed by App Bridge — not rendered as plain HTML buttons —
                 * so the non-standard attribute is correct here.
                 * See: https://shopify.dev/docs/api/app-bridge-library/react-components/titlebar
                 */}
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
                                {duplicateLabel}
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
                                {duplicateLabel}
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

                    <div className="flex-1 flex items-start justify-between">
                        <s-stack gap="none">
                            <s-stack
                                direction="inline"
                                gap="base"
                                alignItems="center"
                            >
                                <s-heading>
                                    <div className="text-xl">
                                        {pageProps.title}
                                    </div>
                                </s-heading>

                                {isEditMode && (
                                    <s-badge tone="neutral">
                                        {pageProps.badgeLabel}
                                    </s-badge>
                                )}
                            </s-stack>
                            {isEditMode && updatedAt && (
                                <s-text color="subdued">
                                    {tc("lastEdited", {
                                        time: formatRelativeDate(updatedAt),
                                    })}
                                </s-text>
                            )}
                        </s-stack>

                        {isEditMode && bundleId && (
                            <s-stack direction="inline" gap="small-300" alignItems="center">
                                <s-button
                                    variant="secondary"
                                    icon="view"
                                    commandFor={viewPopoverId}
                                    accessibilityLabel={tActions("view")}
                                >
                                    {tActions("view")}
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    icon="info"
                                    onClick={handleCheckStatus}
                                    loading={isCheckingStatus}
                                    accessibilityLabel={tc("checkStatus")}
                                >
                                    {tc("checkStatus")}
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    icon="menu-horizontal"
                                    commandFor={overflowMenuId}
                                    accessibilityLabel={tc("moreActions")}
                                />
                            </s-stack>
                        )}
                    </div>
                </s-stack>

                {/* View bundle popover */}
                {viewPopoverId && (
                    <s-popover id={viewPopoverId}>
                        <s-box padding="small">
                            <s-stack gap="small">
                                <s-stack gap="small-200">
                                    <s-heading>
                                        {tActions("includedProducts")}
                                    </s-heading>
                                    {uniqueProducts.length ? (
                                        uniqueProducts.map((product) => (
                                            <s-stack key={product.productId}>
                                                <a
                                                    href={`https://${myshopifyDomain}${product.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    <s-text>
                                                        {product.title}
                                                    </s-text>
                                                </a>
                                            </s-stack>
                                        ))
                                    ) : (
                                        <s-text>
                                            {tActions("noProducts")}
                                        </s-text>
                                    )}
                                    {mainProductUrl && bundleType !== "VOLUME_DISCOUNT" && (
                                        <>
                                            <s-divider />
                                            <s-heading>
                                                {tActions("bundleProduct")}
                                            </s-heading>
                                            <a
                                                href={mainProductUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                <s-text>
                                                    {mainProductTitle ||
                                                        bundleName}
                                                </s-text>
                                            </a>
                                        </>
                                    )}
                                </s-stack>
                            </s-stack>
                        </s-box>
                    </s-popover>
                )}

                {/* Overflow menu popover */}
                {overflowMenuId && (
                    <s-popover id={overflowMenuId}>
                        <s-box padding="small">
                            <s-stack gap="small-200">
                                <s-button
                                    variant="tertiary"
                                    icon="plus"
                                    onClick={navActions.createNew}
                                    loading={isCreatingNew}
                                    disabled={isCreatingNew}
                                >
                                    {tc("createNew")}
                                </s-button>
                                <s-button
                                    variant="tertiary"
                                    tone="critical"
                                    icon="delete"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                    disabled={isDeleting}
                                >
                                    {tc("deleteBundle")}
                                </s-button>
                            </s-stack>
                        </s-box>
                    </s-popover>
                )}

                {/* Integration status banner */}
                <WidgetStatusBanner
                    shopDomain={shopDomain}
                    apiKey={apiKey}
                    setupGuideVisible={false}
                    forceRecheck={true}
                />

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
