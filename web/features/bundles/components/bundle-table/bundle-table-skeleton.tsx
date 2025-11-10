"use client";

/**
 * Bundle table skeleton
 */
export function BundleTableSkeleton({ lines = 12 }: { lines?: number }) {
    return (
        <s-section padding="base">
            <div className="p-4">
                <s-stack gap="base">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className="h-2 bg-[#f4f4f4] rounded overflow-hidden relative"
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-[#f4f4f4] via-[#f8f8f8] to-[#f4f4f4] animate-shimmer"
                                style={{
                                    width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                    animationDuration: `${1 + Math.random() * 1.5}s`,
                                }}
                            />
                        </div>
                    ))}
                </s-stack>
            </div>
        </s-section>
    );
}