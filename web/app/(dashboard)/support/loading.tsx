"use client";

import {
    PageSkeleton,
    PageHeaderSkeleton,
    SkeletonCard,
    SkeletonLines,
} from "@/shared";

export default function SupportPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton heading="Support" />
            <s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
            </s-grid>
            <s-section padding="base">
                <SkeletonLines lines={8} random={true} />
            </s-section>
        </PageSkeleton>
    );
}
