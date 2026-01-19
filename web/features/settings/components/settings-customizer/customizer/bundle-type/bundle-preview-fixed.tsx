"use client";

import React from "react";
import { useBundleStore, WIDGET_LAYOUTS } from "@/features/bundles";

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

export function BundlePreviewFixed() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderLayout = () => {
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
        <div className="md:flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-[300px]">
            {/* LEFT: Tabs */}
            <div className="md:w-[260px] border-r border-[#e3e3e3] bg-white">
                <s-stack padding="base">
                    <s-heading>Fixed Bundle Layout</s-heading>
                </s-stack>
                <s-stack gap="none">
                    {WIDGET_LAYOUTS.map(({ label, value }) => {
                        const isActive = displaySettings.layout === value;
                        return (
                            <button
                                key={value}
                                onClick={() => updateDisplaySettings("layout", value)}
                                className={`text-left px-4 py-3 border-l-4 transition cursor-pointer
                                    ${
                                    isActive
                                        ? "border-[#303030] bg-[#f7f7f7] font-semibold"
                                        : "border-transparent hover:bg-[#f7f7f7]"
                                }
                                `}
                            >
                                {label}
                            </button>
                        );
                    })}
                </s-stack>
            </div>

            {/* RIGHT: Content */}
            <div className="flex-1 p-4 bg-[#fafafa]">
                <div className="radius-bundle-widget radius-bundle-widget--customizer">
                    <div
                        className="radius-bundle"
                        style={{
                            maxWidth: `${styleData.boxMaxWidth ?? 450}px`,
                            margin:
                                styleData?.boxAlignment === "left"
                                    ? "0 auto 0 0"
                                    : styleData?.boxAlignment === "right"
                                        ? "0 0 0 auto"
                                        : "0 auto",
                        }}
                    >
                        <div
                            className="radius-bundle__inner"
                            style={{
                                backgroundColor: styleData.boxBgColor || "#ffffff",
                                borderRadius: `${styleData.boxRadius ?? 12}px`,
                                borderStyle: "solid",
                                borderWidth: `${styleData.boxBorderWidth ?? 1}px`,
                                borderColor: styleData.boxBorderColor || "#e3e3e3",
                            }}
                        >
                            <BundleHeader />
                            <RenderLayout />
                            <BundlePricing />
                            <BundleAddToCart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
