"use client";

import { PageHeaderSkeleton, PageSkeleton, SkeletonLines } from "@/shared";

/**
 * Settings page skeleton with sidebar layout
 */
export default function SettingsPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton
                showBackButton={true}
                heading="Settings"
                subtext="Manage your app settings"
            />

            <s-grid gridTemplateColumns="250px 1fr" gap="base">
                <s-grid-item>
                    <s-section padding="base">
                        <div className="p-4">
                            <SkeletonLines lines={15} random={true} />
                        </div>
                    </s-section>
                </s-grid-item>
                <s-grid-item>
                    <s-section padding="base">
                        <div className="p-4">
                            <SkeletonLines lines={20} random={true} />
                        </div>
                    </s-section>
                </s-grid-item>
            </s-grid>
        </PageSkeleton>
    );
}
