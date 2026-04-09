"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    StepContent,
    useBundleCreationForm,
} from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import { GlobalBanner, usePlan } from "@/shared";
import { WidgetStatusBanner } from "@/features/dashboard";

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
    const duplicateLabel = canDuplicate
        ? tc("duplicate")
        : `${tc("duplicate")} (Pro)`;

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
