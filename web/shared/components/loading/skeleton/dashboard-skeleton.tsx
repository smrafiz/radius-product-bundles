"use client";

/**
 * Dashboard Skeleton Component
 */

const SKELETON_WIDTHS = [75, 90, 65, 85, 95, 70, 80, 88];
const SKELETON_DURATIONS = [1.5, 2.0, 1.8, 2.2, 1.7, 2.1, 1.9, 2.3];

export function DashboardSkeleton() {
    const itemSkeleton = (startIndex: number = 0) => {
        return (
            <div className="p-4">
                <s-stack gap="base">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const index = (startIndex + i) % SKELETON_WIDTHS.length;
                        return (
                            <div
                                key={i}
                                className="h-2 bg-[#f4f4f4] rounded overflow-hidden relative"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-[#f4f4f4] via-[#f8f8f8] to-[#f4f4f4] animate-shimmer"
                                    style={{
                                        width: `${SKELETON_WIDTHS[index]}%`,
                                        animationDuration: `${SKELETON_DURATIONS[index]}s`,
                                    }}
                                />
                            </div>
                        );
                    })}
                </s-stack>
            </div>
        );
    };

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                    <s-grid-item gridColumn="span 8" gridRow="span 1">
                        <s-stack gap="large">
                            <s-section padding="base">
                                {itemSkeleton(0)}
                            </s-section>
                            <s-section padding="base">
                                {itemSkeleton(2)}
                            </s-section>
                        </s-stack>
                    </s-grid-item>
                    <s-grid-item gridColumn="span 4" gridRow="span 1">
                        <s-section padding="base">
                            <s-stack gap="base">
                                {itemSkeleton(4)}
                                {itemSkeleton(6)}
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-page>
    );
}
