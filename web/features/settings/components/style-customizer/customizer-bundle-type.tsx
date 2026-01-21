"use client";

import type { ComponentType } from "react";
import { useState } from "react";

import { BUNDLE_TYPES } from "@/features/bundles";

import {
    BundleOptionType,
    BundlePreviewBogo,
    BundlePreviewBuyGet,
    BundlePreviewFixed,
    CustomizerHeader,
} from "@/features/settings";

export const BUNDLE_PREVIEW_MAP: Record<string, ComponentType> = {
    FIXED_BUNDLE: BundlePreviewFixed,
    BUY_X_GET_Y: BundlePreviewBuyGet,
    BOGO: BundlePreviewBogo,
};

export function CustomizerBundleType() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState<string>(types[0].id);

    const PreviewComponent = activeId ? BUNDLE_PREVIEW_MAP[activeId] : null;

    return (
        <div className="rtpb-full-modal-editor">
            <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                {/* Left option */}
                <div className="rtpb-left-setting">
                    <div className="sticky top-0">
                        <BundleOptionType />
                    </div>
                </div>

                {/* Right review */}
                <div className="rtpb-right-review">
                    <s-stack gap="base">
                        <CustomizerHeader
                            activeBundleType={activeId}
                            onBundleTypeChange={setActiveId}
                        />

                        {PreviewComponent ? (
                            <PreviewComponent />
                        ) : (
                            <s-text>No preview available</s-text>
                        )}
                    </s-stack>
                </div>
            </div>
        </div>
    );
}
