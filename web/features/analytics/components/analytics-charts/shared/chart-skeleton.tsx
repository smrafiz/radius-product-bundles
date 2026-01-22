import { SkeletonLine } from "@/shared";
import { ReactNode } from "react";

export function ChartSkeleton({ tabs = false }: { tabs?: boolean }) {
    return (
        <s-section>
            <s-stack gap="base">
                {/* Header */}
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    {/* Title + value */}
                    <s-stack gap="base">
                        {/* Title skeleton */}
                        <div className="w-55">
                            <SkeletonLine
                                height="h-5"
                                width={100}
                                duration={1.5}
                            />
                        </div>
                        {/* Value skeleton */}
                        <div className="w-35 mt-1">
                            <SkeletonLine
                                height="h-7"
                                width={100}
                                duration={1.8}
                            />
                        </div>
                    </s-stack>

                    {/* Tabs */}
                    {tabs && (
                        <s-stack direction="inline" gap="none">
                            <div className="w-52.5 h-7 rounded-lg overflow-hidden">
                                <SkeletonLine
                                    height="h-[28px]"
                                    width={210}
                                    duration={1.9}
                                />
                            </div>
                        </s-stack>
                    )}
                </s-stack>

                {/* Chart */}
                <div className="chart-skeleton">
                    <SkeletonLine height="h-[272px]" width={100} duration={2} />
                </div>

                {/* Date range */}
                <s-stack
                    direction="inline"
                    gap="small-200"
                    alignItems="center"
                    justifyContent="center"
                >
                    <div className="w-50">
                        <SkeletonLine height="h-4" width={100} duration={1.8} />
                    </div>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
