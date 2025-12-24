"use client";

import { useState } from "react";
import type { ComponentType } from "react";

import { BUNDLE_TYPES } from "@/features/bundles";
import {
    BundlePreviewFixed,
    BundlePreviewBuyGet,
    BundlePreviewBogo,
} from "@/features/settings";

export const BUNDLE_PREVIEW_MAP: Record<string, ComponentType> = {
    FIXED_BUNDLE: BundlePreviewFixed,
    BUY_X_GET_Y: BundlePreviewBuyGet,
    BOGO: BundlePreviewBogo,
};

export function CustomizerBundleTab() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState(types[0]?.id);

    const ActiveComponent = activeId && BUNDLE_PREVIEW_MAP[activeId];

    const PreviewComponent = BUNDLE_PREVIEW_MAP[activeId];

    return (
        <div className="md:flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-[300px]">
            {/* LEFT: Tabs */}
            <div className="md:w-[260px] border-r border-[#e3e3e3] bg-white">
                <s-stack gap="none">
                    {types.map((type) => {
                        const isActive = type.id === activeId;

                        return (
                            <button
                                key={type.id}
                                onClick={() => setActiveId(type.id)}
                                className={`text-left px-4 py-3 border-l-4 transition
                                    ${
                                        isActive
                                            ? "border-[#303030] bg-[#f7f7f7] font-semibold"
                                            : "border-transparent hover:bg-[#f7f7f7]"
                                    }
                                `}
                            >
                                {type.label}
                            </button>
                        );
                    })}
                </s-stack>
            </div>

            {/* RIGHT: Content */}
            <div className="flex-1 p-6 bg-[#fafafa]">
                {ActiveComponent ? (
                    <s-stack gap="base">
                        {PreviewComponent && <PreviewComponent />}
                    </s-stack>
                ) : (
                    <s-text>No preview available</s-text>
                )}
            </div>
        </div>
    );
}
