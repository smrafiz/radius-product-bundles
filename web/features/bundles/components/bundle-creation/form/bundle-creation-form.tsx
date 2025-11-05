"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    getBundleProperty,
    HorizontalStepIndicator,
    StepContent,
    StepNavigation,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, Layout, Page } from "@shopify/polaris";
import { GlobalBanner, useAppNavigation } from "@/shared";

export function BundleCreationForm({
    bundleType,
    bundleName,
}: BundleCreationFormProps) {
    const { goBack } = useAppNavigation();
    const { bundleData, setBundleData } = useBundleStore();
    const { setValue } = useBundleFormMethods();

    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType);
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

    const pageProps = isEditMode
        ? {
            title: `Edit ${bundleName || getBundleProperty(bundleType, "label")}`,
            subtitle: "Update your bundle settings and preview changes",
            backAction: {
                content: "Back to Bundles",
                onAction: goBack,
            },
        }
        : {
            title: `Create ${getBundleProperty(bundleType, "label")}`,
            subtitle:
                "Configure your bundle settings and preview the customer experience",
            backAction: {
                content: "Bundle Selection",
                onAction: goBack,
            },
        };

    //const pageProps = getPageProps();

    return (
        <s-page {...pageProps}>

            <s-stack gap="base">
                {/* Banner */}
                <GlobalBanner />

                {/* Horizontal Step Indicator */}
                <HorizontalStepIndicator />

                {/* Navigation Buttons */}
                {/*<StepNavigation />*/}

                {/* Main Content Section */}
                <s-box>
                    <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                        <s-grid-item gridColumn="span 7" gridRow="span 1">
                            <StepContent />
                        </s-grid-item>

                        <s-grid-item gridColumn="span 5" gridRow="span 1">
                            <BundlePreview bundleType={bundleType} />
                        </s-grid-item>
                    </s-grid>
                </s-box>
            </s-stack>
        </s-page>
    );
}
