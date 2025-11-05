"use client";

export default function BundlePageSkeleton({ lines = 6 }: { lines?: number }) {
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
                            <div className="text-xl">Bundle Management</div>
                        </s-heading>
                        <s-text>
                            Create and manage your product bundle offers
                        </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="small-200">
                        <s-button
                            icon="view"
                            variant="secondary"
                            accessibilityLabel="Bundle Studio"
                            onClick={() => {}}
                        >
                            Bundle Studio
                        </s-button>
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel="Create Bundle"
                            onClick={() => {}}
                        >
                            Create Bundle
                        </s-button>
                    </s-stack>
                </s-stack>

                <s-section padding="base">
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
                </s-section>
            </s-stack>
        </s-page>
    );
}
