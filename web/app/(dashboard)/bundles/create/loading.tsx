"use client";

export default function BundlePageSkeleton({ lines = 6 }: { lines?: number }) {
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

                <s-section padding="base">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                        gap="base"
                        justifyContent="center"
                    >
                        <s-grid-item gridColumn="auto">
                            <div className="animate-pulse space-y-3 p-5">
                                {Array.from({ length: lines }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-2 bg-[#ebebeb] rounded"
                                        style={{
                                            width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </s-grid-item>
                        <s-grid-item gridColumn="auto">
                            <div className="animate-pulse space-y-3 p-5">
                                {Array.from({ length: lines }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-2 bg-[#ebebeb] rounded"
                                        style={{
                                            width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </s-grid-item>
                        <s-grid-item gridColumn="auto">
                            <div className="animate-pulse space-y-3 p-5">
                                {Array.from({ length: lines }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-2 bg-[#ebebeb] rounded"
                                        style={{
                                            width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </s-grid-item>
                    </s-grid>
                </s-section>
            </s-stack>
        </s-page>
    );
}
