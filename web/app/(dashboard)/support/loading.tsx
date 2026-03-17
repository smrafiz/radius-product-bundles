"use client";

import { PageSkeleton, SkeletonLines } from "@/shared";

export default function SupportPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <s-box>
                <s-grid gridTemplateColumns="1fr 300px" gap="base">
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="p-2">
                                <SkeletonLines lines={20} random={true} />
                            </div>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="p-2">
                                <SkeletonLines lines={10} random={true} />
                            </div>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </s-box>
        </PageSkeleton>
    );
}
