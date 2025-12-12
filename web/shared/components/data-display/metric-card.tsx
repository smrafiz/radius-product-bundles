"use client";

import { MetricCardProps, SkeletonLine } from "@/shared";

/**
 * Metric card component with integrated loading state
 */
export function MetricCard({
    title,
    value,
    icon,
    tone,
    loading = false,
}: MetricCardProps) {
    const isLoading =
        loading || value === undefined || value === null || value === "";

    return (
        <s-section>
            <s-stack>
                <s-stack direction="inline" gap="base" alignItems="center">

                    <s-stack gap="small-400">
                        <s-heading>{title}</s-heading>

                        {isLoading ? (
                            <div className="h-[20px] w-[40px]">
                                <SkeletonLine height="h-[20px]" />
                            </div>
                        ) : (
                            <s-stack direction="inline" gap="small-200">
                                <s-text tone="info">
                                    <div className="text-[20px]">{value}</div>
                                </s-text>

                                {tone && icon && (
                                    <s-badge tone={tone} icon={icon}>
                                        12%
                                    </s-badge>
                                )}
                            </s-stack>
                        )}
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
