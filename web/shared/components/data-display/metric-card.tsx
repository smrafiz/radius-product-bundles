"use client";

import { useAppNavigation } from "@/shared";
import { MetricCardProps, SkeletonLine } from "@/shared";

/**
 * Metric card component with integrated loading state
 */
export function MetricCard({
    title,
    value,
    tone,
    img,
    loading = false,
    growth = null,
    action,
}: MetricCardProps) {
    const { goTo } = useAppNavigation();
    const isLoading =
        loading || value === undefined || value === null || value === "";

    const content = (
        <s-stack>
            <div className="flex gap-3 flex-nowrap">
                <div className="shrink-0 items-center w-11 h-11">
                    {img?.url && (
                        <img
                            className="w-11 h-11"
                            src={img.url}
                            alt={img.alt}
                        />
                    )}
                    {img?.svg && (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: img?.svg,
                            }}
                        />
                    )}
                </div>
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

                            {tone && growth !== null && growth !== 0 && (
                                <s-badge
                                    tone={
                                        growth > 0 ? "success" : "critical"
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
            </div>
        </s-stack>
    );

    if (action) {
        return (
            <div className="transition-all hover:-translate-y-0.75">
                <s-clickable
                    onClick={goTo(action.url)}
                    inlineSize="100%"
                    accessibilityLabel={action.label}
                >
                    <s-section>{content}</s-section>
                </s-clickable>
            </div>
        );
    }

    return <s-section>{content}</s-section>;
}
