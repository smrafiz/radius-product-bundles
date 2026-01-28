"use client";

import React from "react";
import { WIDGET_LAYOUTS } from "@/features/bundles";
import {
    BundleAddToCart,
    BundleCarousel,
    BundleCompact,
    BundleGrid,
    BundleHeader,
    BundleList,
    BundlePricing,
    useCustomizer
} from "@/features/settings";

import "@/styles/components/bundle.css";

/**
 * Preview component for Fixed Bundle type.
 */
export function BundlePreviewFixed() {
    const { styles, activeLayout, setActiveLayout } = useCustomizer();

    /**
     * Renders the appropriate layout component.
     */
    const RenderLayout = () => {
        switch (activeLayout) {
            case "GRID":
                return <BundleGrid />;
            case "LIST":
                return <BundleList />;
            // case "CAROUSEL":
            //     return <BundleCarousel />;
            // case "COMPACT":
            //     return <BundleCompact />;
            default:
                return <BundleList />;
        }
    };

    return (
        <div className="md:flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-75">
            {/* LEFT: Layout Tabs */}
            <div className="md:w-65 border-r border-[#e3e3e3] bg-white">
                <s-stack padding="base">
                    <s-heading>Fixed Bundle Layout</s-heading>
                </s-stack>
                <s-stack gap="none">
                    {WIDGET_LAYOUTS.map(({ label, value }) => {
                        const isActive = activeLayout === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setActiveLayout(value)}
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

            {/* RIGHT: Preview */}
            <div className="flex-1 p-4 bg-[#fafafa]">
                <div className="radius-bundle-widget radius-bundle-widget--customizer">
                    <div
                        className="radius-bundle"
                        style={{
                            maxWidth: `${styles.boxMaxWidth}px`,
                            margin:
                                styles.boxAlignment === "left"
                                    ? "0 auto 0 0"
                                    : styles.boxAlignment === "right"
                                      ? "0 0 0 auto"
                                      : "0 auto",
                        }}
                    >
                        <div
                            className="radius-bundle__inner"
                            style={{
                                backgroundColor: styles.boxBgColor,
                                borderRadius: `${styles.boxRadius}px`,
                                borderStyle: "solid",
                                borderWidth: `${styles.boxBorderWidth}px`,
                                borderColor: styles.boxBorderColor,
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
