"use client";

export function DashboardSkeleton() {
    const itemSkeleton = () => {
        return (
            <s-stack gap="small">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-2 bg-[#ebebeb] rounded overflow-hidden relative"
                    >
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-[#ebebeb] via-[#f5f5f5] to-[#ebebeb] animate-shimmer"
                            style={{
                                width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                animationDuration: `${1 + Math.random() * 1.5}s`,
                            }}
                        />
                    </div>
                ))}
            </s-stack>
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
                                {itemSkeleton()}
                            </s-section>
                            <s-section padding="base">
                                {itemSkeleton()}
                            </s-section>
                        </s-stack>
                    </s-grid-item>
                    <s-grid-item gridColumn="span 4" gridRow="span 1">
                        <s-section padding="base">
                            <s-stack gap="small">
                                {itemSkeleton()}
                                {itemSkeleton()}
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-page>
    );
}
