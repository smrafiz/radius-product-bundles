"use client";

import { useState } from "react";
import { BUNDLE_TYPES } from "@/features/bundles";

export function CustomizerBundleType() {
    const types = Object.values(BUNDLE_TYPES);

    // Default active tab
    const [activeId, setActiveId] = useState(types[0]?.id);

    const activeType = types.find((t) => t.id === activeId);

    return (
        <div className="flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-[300px]">
            {/* LEFT: Tabs */}
            <div className="w-[260px] border-r border-[#e3e3e3] bg-[#fafafa]">
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
                                        ? "border-[#303030] bg-white font-semibold"
                                        : "border-transparent hover:bg-[#f1f1f1]"
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
            <div className="flex-1 p-6">
                {activeType ? (
                    <s-stack gap="base">
                        <s-heading>{activeType.label}</s-heading>

                        <s-text>
                            {activeType.description ??
                                "Configure settings for this bundle type."}
                        </s-text>

                        {/* Replace with real content */}
                        <div className="border border-dashed border-[#d4d4d4] rounded-lg p-4">
                            Content for <b>{activeType.label}</b>
                        </div>
                    </s-stack>
                ) : (
                    <s-text>Select a bundle type</s-text>
                )}
            </div>
        </div>
    );
}
