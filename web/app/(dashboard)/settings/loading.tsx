"use client";

import { PageSkeleton, SkeletonLines } from "@/shared";

/**
 * Settings page skeleton with sidebar layout
 */
export default function SettingsPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <s-box>
                <s-grid gridTemplateColumns="250px 1fr" gap="base">
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="p-2">
                                <SkeletonLines lines={8} random={true} />
                            </div>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="p-2">
                                <SkeletonLines lines={20} random={true} />
                            </div>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </s-box>
        </PageSkeleton>
    );
}
