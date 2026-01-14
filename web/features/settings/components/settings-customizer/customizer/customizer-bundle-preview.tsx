"use client";

import {
    useBundleStore,
} from "@/features/bundles";

import {
    BundleHeader,
    BundlePricing,
    BundleAddToCart,
    BundleGrid,
    BundleList,
    BundleCarousel,
    BundleCompact,
} from "@/features/settings";

import "@/styles/components/bundle.css";
import React from "react";

export function CustomizerBundlePreview() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const renderLayout = () => {
        switch (displaySettings.layout) {
            case "GRID":
                return <BundleGrid />;

            case "LIST":
                return <BundleList />;

            case "CAROUSEL":
                return <BundleCarousel />;

            case "COMPACT":
                return <BundleCompact />;

            default:
                return <BundleList />;
        }
    };

    return (
            <div className="radius-bundle-widget">
                <div className="radius-bundle">
                    <div
                        className="radius-bundle__inner"
                        style={{
                            backgroundColor: styleData.boxBgColor || "#ffffff",
                            borderRadius: `${styleData.boxRadius ?? 12}px`,
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

                        <BundleHeader />
                        {renderLayout()}
                        <BundlePricing />
                        <BundleAddToCart />
                    </div>
                </div>
            </div>
    );
}
