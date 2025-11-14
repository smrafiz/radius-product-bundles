"use client";

import { SkeletonLines } from "@/shared";

/**
 * Bundle table skeleton component
 */
export function BundleTableSkeleton({ lines = 12 }: { lines?: number }) {
    return (
        <s-section padding="base">
            <div className="p-4">
                <SkeletonLines lines={lines} random={true} />
            </div>
        </s-section>
    );
}