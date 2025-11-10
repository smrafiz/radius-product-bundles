"use client";

export default function BundlePageSkeleton() {
    const itemSkeleton = () => {
        return (
            <s-grid-item gridColumn="span 4" gridRow="span 1">
                <s-section padding="base">
                    <div className="p-4">
                        <s-stack gap="base">
                            {Array.from({ length: 14 }).map((_, i) => (
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
            </s-grid-item>
        );
    };

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={() => {}}
                            icon="arrow-left"
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Pricing & plans</div>
                        </s-heading>
                        <s-text>Choose the right plan for your business</s-text>
                    </s-stack>
                </s-stack>

                <s-section padding="base">
                    <div className="p-4">
                        <s-stack gap="base">
                            {Array.from({ length: 3 }).map((_, i) => (
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

                <s-grid
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap="base"
                    paddingBlockStart="large"
                >
                    {itemSkeleton()}
                    {itemSkeleton()}
                    {itemSkeleton()}
                </s-grid>

                <s-section padding="base">
                    <div className="p-4">
                        <s-stack gap="base">
                            {Array.from({ length: 6 }).map((_, i) => (
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
