"use client";

export default function BundlePageSkeleton() {

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button onClick={() =>{}} icon="arrow-left"></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Settings</div>
                        </s-heading>
                        <s-text>Choose the right plan for your business</s-text>
                    </s-stack>
                </s-stack>

                <s-grid gridTemplateColumns="250px 1fr" gap="base">
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="animate-pulse space-y-3">
                                {Array.from({ length: 25 }).map((_, i) => (
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
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <div className="animate-pulse space-y-3">
                                {Array.from({ length: 24 }).map((_, i) => (
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
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-page>
    );
}
