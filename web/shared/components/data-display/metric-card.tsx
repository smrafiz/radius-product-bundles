"use client";

import { MetricCardProps, SkeletonLine } from "@/shared";

/**
 * Metric card component with integrated loading state
 */
export function MetricCard({
    title,
    value,
    tone,
    loading = false,
    growth = null,
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
                            <div className="h-5 w-10">
                                <SkeletonLine height="h-[20px]" />
                            </div>
                        ) : (
                            <s-stack direction="inline" gap="small-200">
                                <s-text tone="info">
                                    <div className="text-[20px]">{value}</div>
                                </s-text>

                                {tone &&
                                    growth !== null &&
                                    growth !== 0 && (
                                        <s-badge
                                            tone={
                                                growth > 0
                                                    ? "success"
                                                    : "critical"
                                            }
                                            icon={
                                                growth > 0
                                                    ? "arrow-up"
                                                    : "arrow-down"
                                            }
                                        >
                                            {Math.abs(growth).toFixed(1)}%
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
