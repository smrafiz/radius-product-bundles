"use client";

export default function BundlePageSkeleton() {
    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack
                    direction="inline"
                    gap="base"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <s-stack>
                        <s-heading>
                            <div className="text-xl text-center">Bundle Management</div>
                        </s-heading>
                        <s-text>
                            <div className="text-center">Create and manage your product bundle offers</div>
                        </s-text>
                    </s-stack>
                </s-stack>

                <s-section padding="base">
                    <div className="p-4">
                        <s-stack gap="base">
                            {Array.from({ length: 8 }).map((_, i) => (
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
            </s-stack>
        </s-page>
    );
}
