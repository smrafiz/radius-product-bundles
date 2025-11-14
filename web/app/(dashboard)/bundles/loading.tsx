"use client";

import { PageSkeleton, SkeletonCard, SkeletonLines } from "@/shared";

/**
 * Bundle management page skeleton
 */
export default function BundleManagementSkeleton() {
    return (
        <PageSkeleton
            heading="Bundle Management"
            showPrimaryAction={true}
            primaryActionText="Create Bundle"
            showSecondaryAction={true}
            secondaryActionText="Bundle Studio"
            withPadding={true}
        >
            <s-stack>
                <s-heading>
                    <div className="text-xl text-center">Bundle Management</div>
                </s-heading>
                <s-text>
                    <div className="text-center">
                        Create and manage your product bundle offers
                    </div>
                </s-text>
            </s-stack>

            <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                <SkeletonCard
                    gridColumn="span 3"
                    lines={3}
                    gap="small-300"
                    height="h-1"
                    random={true}
                />
                <SkeletonCard
                    gridColumn="span 3"
                    lines={3}
                    gap="small-300"
                    height="h-1"
                    random={true}
                />
                <SkeletonCard
                    gridColumn="span 3"
                    lines={3}
                    gap="small-300"
                    height="h-1"
                    random={true}
                />
                <SkeletonCard
                    gridColumn="span 3"
                    lines={3}
                    gap="small-300"
                    height="h-1"
                    random={true}
                />
            </s-grid>

            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={12} random={true} />
                </div>
            </s-section>
        </PageSkeleton>
    );
}
