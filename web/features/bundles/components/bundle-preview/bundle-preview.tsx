"use client";

import {
    BundleHeader,
    BundlePricing,
    BundlePriority,
    BundleAddToCart,
    BundleLayoutGrid,
    BundleLayoutList,
    BundleLayoutCompact,
    BundlePreviewStatus,
    BundleLayoutCarousel,
    useBundleStore,
} from "@/features/bundles";
import "@/styles/components/bundle.css";
import React from "react";
import { useRouter } from "next/navigation";

export function BundlePreview() {
    const router = useRouter();
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const renderLayout = () => {
        switch (displaySettings.layout) {
            case "GRID":
                return <BundleLayoutGrid />;

            case "LIST":
                return <BundleLayoutList />;

            case "CAROUSEL":
                return <BundleLayoutCarousel />;

            case "COMPACT":
                return <BundleLayoutCompact />;

            default:
                return <BundleLayoutGrid />;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <BundlePreviewStatus />
            <BundlePriority />

            <div className="radius-bundle-widget">
                <div className="radius-bundle">
                    <div
                        className="radius-bundle__inner"
                        style={{
                            backgroundColor: styleData.boxBgColor || "#ffffff",
                            borderRadius: `${styleData.boxRadius ?? 12}px`,
                            color: styleData.boxTextColor || "#303030",
                            ...((styleData.boxBorderEnabled ?? true)
                                ? {
                                    borderStyle: "solid",
                                    borderWidth: `${styleData.boxBorderWidth ?? 1}px`,
                                    borderColor:
                                        styleData.boxBorderColor || "#e3e3e3",
                                }
                                : {}),
                        }}
                    >
                        <s-stack paddingBlockEnd="base" >
                            <s-stack direction="inline" justifyContent="space-between" alignItems="center" paddingBlockEnd="small-200">
                                <s-heading>Preview</s-heading>
                                <s-button
                                    variant="tertiary"
                                    onClick={() => router.push("/settings")}
                                >Customization</s-button>
                            </s-stack>
                            <s-divider />
                        </s-stack>

                        <BundleHeader />
                        {renderLayout()}
                        <BundlePricing />
                        <BundleAddToCart />
                    </div>
                </div>
            </div>
        </div>
    );
}
