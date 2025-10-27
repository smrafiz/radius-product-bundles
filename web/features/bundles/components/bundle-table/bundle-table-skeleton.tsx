"use client";

import {
    Box,
    Card,
    SkeletonBodyText,
    SkeletonDisplayText,
} from "@shopify/polaris";

/**
 * Bundle table skeleton
 */
export function BundleTableSkeleton({ lines = 6 }: { lines?: number }) {
    return (
        <s-section padding="base">
            <div className="animate-pulse space-y-3 p-5">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className="h-2 bg-[#ebebeb] rounded"
                        style={{
                            width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                        }}
                    />
                ))}
            </div>
        </s-section>
    );
}