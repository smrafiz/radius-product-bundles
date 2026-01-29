"use client";

import { SkeletonLine } from "@/shared";
import React from "react";

/**
 * Skeleton for a single collapsible section header.
 */
function SectionHeaderSkeleton() {
    return (
        <div className="border-b border-[#e3e3e3] p-4">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <div className="w-24">
                    <SkeletonLine height="h-5" width={80} />
                </div>
                <div className="w-4">
                    <SkeletonLine height="h-4" width={100} />
                </div>
            </s-stack>
        </div>
    );
}

/**
 * Skeleton for expanded section with fields.
 */
function SectionContentSkeleton({ fields = 3 }: { fields?: number }) {
    return (
        <div className="border-b border-[#e3e3e3] p-4">
            <s-stack gap="base">
                {/* Section header */}
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <div className="w-20">
                        <SkeletonLine height="h-5" width={75} />
                    </div>
                    <div className="w-4">
                        <SkeletonLine height="h-4" width={100} />
                    </div>
                </s-stack>

                {/* Fields grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                    {Array.from({ length: fields }).map((_, i) => (
                        <s-stack key={i} gap="small-200">
                            <div className="w-20">
                                <SkeletonLine height="h-3" width={70} />
                            </div>
                            <div className="w-full">
                                <SkeletonLine height="h-9" width={100} />
                            </div>
                        </s-stack>
                    ))}
                </div>
            </s-stack>
        </div>
    );
}

/**
 * Skeleton for the left settings panel.
 */
function SettingsPanelSkeleton() {
    return (
        <div className="border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                {/* Collapsed sections */}
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />
                <SectionHeaderSkeleton />

                {/* Restore defaults button */}
                <div className="p-4 flex justify-center">
                    <div className="w-36">
                        <SkeletonLine height="h-7" width={100} />
                    </div>
                </div>
            </s-stack>
        </div>
    );
}

/**
 * Skeleton for the bundle type tabs.
 */
function BundleTypeTabsSkeleton() {
    return (
        <s-section>
            <s-stack gap="none" direction="inline" justifyContent="space-between">
                <div className="w-28">
                    <SkeletonLine height="h-9" width={100} />
                </div>
                <div className="w-38">
                    <SkeletonLine height="h-9" width={100} />
                </div>
            </s-stack>
        </s-section>
    );
}

/**
 * Skeleton for layout tab item.
 */
function LayoutTabSkeleton({ isActive = false }: { isActive?: boolean }) {
    return (
        <div
            className={`px-4 py-3 border-l-4 ${
                isActive
                    ? "border-[#e3e3e3] bg-[#f7f7f7]"
                    : "border-transparent"
            }`}
        >
            <div className="w-16">
                <SkeletonLine height="h-4" width={80} />
            </div>
        </div>
    );
}

/**
 * Skeleton for the preview card.
 */
function BundlePreviewContentSkeleton() {
    return (
        <div className="border border-[#e3e3e3] rounded-xl bg-white p-4 w-150">
            <s-stack gap="base" justifyContent="center">
                {/* Bundle header */}
                <div className="w-40">
                    <SkeletonLine height="h-6" width={85} />
                </div>

                {/* Product items */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="border border-[#e3e3e3] rounded-lg p-3"
                    >
                        <s-stack
                            direction="inline"
                            gap="base"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <s-stack direction="inline" gap="base" alignItems="center">
                                {/* Product image */}
                                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                                    <SkeletonLine height="h-14" width={100} />
                                </div>

                                {/* Product details */}
                                <s-stack gap="small-200">
                                    <div className="w-28">
                                        <SkeletonLine height="h-4" width={90} />
                                    </div>
                                    <div className="w-16">
                                        <SkeletonLine height="h-3" width={70} />
                                    </div>
                                </s-stack>
                            </s-stack>

                            {/* Price */}
                            <div className="w-14 shrink-0">
                                <SkeletonLine height="h-4" width={80} />
                            </div>
                        </s-stack>
                    </div>
                ))}

                {/* Pricing summary */}
                <s-stack gap="small-200" alignItems="end">
                    <div className="w-28">
                        <SkeletonLine height="h-4" width={85} />
                    </div>
                    <div className="w-20">
                        <SkeletonLine height="h-5" width={90} />
                    </div>
                </s-stack>

                {/* Add to cart button */}
                <div className="w-full">
                    <SkeletonLine height="h-11" width={100} />
                </div>
            </s-stack>
        </div>
    );
}

/**
 * Skeleton for the preview card with layout tabs.
 */
function PreviewCardSkeleton() {
    return (
        <div className="md:flex border border-[#e3e3e3] rounded-xl overflow-hidden min-h-75">
            {/* LEFT: Layout Tabs */}
            <div className="md:w-65 border-r border-[#e3e3e3] bg-white">
                <s-stack padding="base">
                    <div className="w-36">
                        <SkeletonLine height="h-5" width={90} />
                    </div>
                </s-stack>
                <s-stack gap="none">
                    <LayoutTabSkeleton isActive />
                    <LayoutTabSkeleton />
                    <LayoutTabSkeleton />
                    <LayoutTabSkeleton />
                </s-stack>
            </div>

            {/* RIGHT: Preview */}
            <div className="flex-1 p-4 bg-[#fafafa] flex justify-center">
                <BundlePreviewContentSkeleton />
            </div>
        </div>
    );
}

/**
 * Full customizer page skeleton.
 */
export function CustomizerSkeleton() {
    return (
        <s-page heading="Style Customizer" inlineSize="large">
            {/* Save button skeleton */}
            <div slot="primary-action" className="w-16">
                <SkeletonLine height="h-9" width={100} />
            </div>

            <s-stack paddingBlock="base large-300">
                <div className="rtpb-full-modal-editor">
                    <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                        {/* Left settings panel */}
                        <div className="rtpb-left-setting">
                            <div className="sticky top-0">
                                <SettingsPanelSkeleton />
                            </div>
                        </div>

                        {/* Right preview area */}
                        <div className="rtpb-right-review">
                            <s-stack gap="base">
                                {/* Bundle type tabs */}
                                <BundleTypeTabsSkeleton />

                                {/* Preview card */}
                                <PreviewCardSkeleton />
                            </s-stack>
                        </div>
                    </div>
                </div>
            </s-stack>
        </s-page>
    );
}
