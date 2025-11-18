"use client";

import {
    PageHeaderSkeleton,
    PageSkeleton,
    SkeletonCard,
    SkeletonLines,
} from "@/shared";

/**
 * Pricing & plans page skeleton
 */
export default function PricingPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton
                showBackButton={true}
                heading="Pricing & plans"
                subtext="Choose the right plan for your business"
            />

            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={2} random={true} />
                </div>
            </s-section>

            <s-grid
                gridTemplateColumns="repeat(12, 1fr)"
                gap="base"
                paddingBlockStart="large"
            >
                <SkeletonCard gridColumn="span 4" lines={10} random={true} />
                <SkeletonCard gridColumn="span 4" lines={10} random={true} />
                <SkeletonCard gridColumn="span 4" lines={10} random={true} />
            </s-grid>

            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={6} random={true} />
                </div>
            </s-section>
        </PageSkeleton>
    );
}
