"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { PageHeaderSkeleton, PageSkeleton, SkeletonLines } from "@/shared";

export function BundleSelectionSkeleton() {
    const t = useTranslations("Bundles.Selection");

    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton
                showBackButton={true}
                heading={t("title")}
                subtext={t("description")}
            />

            <s-stack gap="base">
                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                    gap="base"
                    justifyContent="center"
                >
                    {Array.from({ length: 6 }).map((_, index) => (
                        <s-grid-item key={index} gridColumn="auto">
                            <s-section padding="base">
                                <div className="p-4">
                                    <SkeletonLines lines={8} random={true} />
                                </div>
                            </s-section>
                        </s-grid-item>
                    ))}
                </s-grid>
            </s-stack>

            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={6} random={true} />
                </div>
            </s-section>
        </PageSkeleton>
    );
}
