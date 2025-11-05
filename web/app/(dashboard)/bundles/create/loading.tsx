"use client";

export default function BundlePageSkeleton() {
    const gridItems = Array.from({ length: 6 });
    const skeletonLines = Array.from({ length: 8 });

    return (
        <s-page>
            <s-stack gap="large" paddingBlockStart="large" paddingBlockEnd="large">
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button onClick={() => {}} icon="arrow-left"></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Select bundle type</div>
                        </s-heading>
                        <s-text>
                            Choose the type of bundle that best fits your offer
                        </s-text>
                    </s-stack>
                </s-stack>

                <s-stack gap="base">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                        gap="base"
                        justifyContent="center"
                    >
                        {gridItems.map((_, index) => (
                            <s-grid-item key={index} gridColumn="auto">
                                <s-box
                                    background="base"
                                    border="base"
                                    borderRadius="base"
                                >
                                    <div className="animate-pulse space-y-3 p-5">
                                        {skeletonLines.map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-2 bg-[#ebebeb] rounded"
                                                style={{
                                                    width: `${Math.floor(
                                                        Math.random() * (100 - 60 + 1)
                                                    ) + 60}%`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </s-box>
                            </s-grid-item>
                        ))}
                    </s-grid>
                </s-stack>

                <s-section padding="base">
                    <div className="animate-pulse space-y-3 p-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-2 bg-[#ebebeb] rounded"
                                style={{
                                    width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                }}
                            />
                        ))}
                    </div>
                </s-section>

            </s-stack>
        </s-page>
    );
}
