"use client";

import {
    StepContent,
    BundlePreview,
    useBundleFormManager,
    BundleCreationSkeleton,
    HorizontalStepIndicator,
    BundleCreationFormProps,
} from "@/features/bundles";
import { GlobalBanner, useAppNavigation } from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";

/**
 * Bundle Creation Form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
}: BundleCreationFormProps) {
    const { bundleData } = useAppNavigation();
    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });

    return (
        <s-page>
            <TitleBar>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    Bundles
                </button>
            </TitleBar>
            {/*<BundleCreationSkeleton />*/}

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
                            accessibilityLabel="Back"
                        />
                    </s-stack>

                    <s-stack direction="inline" gap="base" alignItems="center">
                        <s-heading>
                            <div className="text-xl">{pageProps.title}</div>
                        </s-heading>

                        {isEditMode && (
                            <s-badge tone="neutral">
                                {pageProps.badgeLabel}
                            </s-badge>
                        )}
                    </s-stack>
                </s-stack>

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
