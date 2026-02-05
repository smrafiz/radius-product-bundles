"use client";

import { PageSkeleton, SkeletonCard, SkeletonLines } from "@/shared";

/**
 * Bundle table skeleton component
 */
export function BundleSkeleton() {
    return (
        <PageSkeleton
            heading="Bundle Management"
            showPrimaryAction={true}
            primaryActionText="Create Bundle"
            showSecondaryAction={true}
            secondaryActionText="Bundle Studio"
            withPadding={false}
        >
            <s-stack>
                <div className="text-center">
                    <s-heading>
                        <div className="text-base text-center">
                            Bundle Management
                        </div>
                    </s-heading>
                    <s-text color="subdued">
                        Create and manage your product bundle offers
                    </s-text>
                </div>
            </s-stack>

            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                gap="base"
                justifyContent="center"
            >
                <s-grid-item gridColumn="auto">
                    <SkeletonCard
                        gridColumn="span 3"
                        lines={3}
                        gap="small-300"
                        height="h-1"
                        random={true}
                    />
                </s-grid-item>
                <s-grid-item gridColumn="auto">
                    <SkeletonCard
                        gridColumn="span 3"
                        lines={3}
                        gap="small-300"
                        height="h-1"
                        random={true}
                    />
                </s-grid-item>
                <s-grid-item gridColumn="auto">
                    <SkeletonCard
                        gridColumn="span 3"
                        lines={3}
                        gap="small-300"
                        height="h-1"
                        random={true}
                    />
                </s-grid-item>
                <s-grid-item gridColumn="auto">
                    <SkeletonCard
                        gridColumn="span 3"
                        lines={3}
                        gap="small-300"
                        height="h-1"
                        random={true}
                    />
                </s-grid-item>
            </s-grid>

            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={12} random={true} />
                </div>
            </s-section>
        </PageSkeleton>
    );
}
