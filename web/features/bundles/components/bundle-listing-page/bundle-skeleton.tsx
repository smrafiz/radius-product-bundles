"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { PageSkeleton, SkeletonCard, SkeletonLines } from "@/shared";

export function BundleSkeleton() {
    const t = useTranslations("Bundles.Listing");

    return (
        <PageSkeleton
            heading={t("title")}
            showPrimaryAction={true}
            primaryActionText={t("createBundle")}
            showSecondaryAction={true}
            secondaryActionText="Bundle Studio"
            withPadding={false}
        >
            <s-stack>
                <div className="text-center">
                    <s-heading>
                        <div className="text-base text-center">
                            {t("title")}
                        </div>
                    </s-heading>
                    <s-text color="subdued">{t("description")}</s-text>
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
