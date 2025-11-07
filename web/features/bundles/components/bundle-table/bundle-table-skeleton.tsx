"use client";

/**
 * Bundle table skeleton
 */
export function BundleTableSkeleton({ lines = 12 }: { lines?: number }) {
    return (
        <s-section padding="base">
            <s-stack gap="small">
                {Array.from({ length: lines }).map((_, i) => (
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
        </s-section>
    );
}