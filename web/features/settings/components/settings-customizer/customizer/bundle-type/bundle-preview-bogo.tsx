"use client";

import { useBundleStore } from "@/features/bundles";

const BOGO_LAYOUTS = [
    { label: "Grid", value: "GRID" },
    { label: "List", value: "LIST" },
] as const;

import {
    BundleHeader,
    BundlePricing,
    BundleAddToCart,
    BundleGrid,
    BundleList,
} from "@/features/settings";

import "@/styles/components/bundle.css";
import React from "react";

export function BundlePreviewBogo() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderLayout = () => {
        switch (displaySettings.layout) {
            case "GRID":
                return <BundleGrid />;

            case "LIST":
                return <BundleList />;

            default:
                return <BundleList />;
        }
    };

    return (
        <div className="md:flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-[300px]">
            {/* LEFT: Tabs */}
            <div className="md:w-[260px] border-r border-[#e3e3e3] bg-white">
                <s-stack padding="base">
                    <s-heading>BOGO Layout</s-heading>
                </s-stack>
                <s-stack gap="none">
                    {BOGO_LAYOUTS.map(({ label, value }) => {
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
                <div className="radius-bundle-widget">
                    <div className="radius-bundle">
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
