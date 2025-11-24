"use client";

import { PageSkeleton, SkeletonLines } from "@/shared";

/**
 * Dashboard skeleton component
 */
export function DashboardSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                <s-grid-item gridColumn="span 8" gridRow="span 1">
                    <s-stack gap="large">
                        <s-section padding="base">
                            <div className="p-3">
                                <SkeletonLines lines={8} startIndex={0} />
                            </div>
                        </s-section>
                        <s-section padding="base">
                            <div className="p-3">
                                <SkeletonLines lines={8} startIndex={2} />
                            </div>
                        </s-section>
                    </s-stack>
                </s-grid-item>
                <s-grid-item gridColumn="span 4" gridRow="span 1">
                    <s-section padding="base">
                        <s-stack gap="base">
                            <div className="p-3">
                                <SkeletonLines lines={18} startIndex={4} />
                            </div>
                        </s-stack>
                    </s-section>
                </s-grid-item>
            </s-grid>
        </PageSkeleton>
    );
}
