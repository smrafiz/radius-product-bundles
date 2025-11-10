"use client";

const skeletonItem = () => {
    return(
        <s-grid-item gridColumn="span 3">
            <s-section padding="base">
                <div className="p-4">
                    <s-stack gap="small-300">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-1 bg-[#f4f4f4] rounded overflow-hidden relative"
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
}

export default function BundlePageSkeleton() {
    return (
        <s-page heading="Bundle Management">
            <s-button slot="primary-action" variant="primary" onClick={() => {}}>
                Create Bundle
            </s-button>
            <s-button slot="secondary-actions" variant="secondary" onClick={() =>{}}>
                Bundle Studio
            </s-button>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <s-heading>
                        <div className="text-xl text-center">Bundle Management</div>
                    </s-heading>
                    <s-text>
                        <div className="text-center">Create and manage your product bundle offers</div>
                    </s-text>
                </s-stack>

                <s-grid
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap="base"
                >
                    {skeletonItem()}
                    {skeletonItem()}
                    {skeletonItem()}
                    {skeletonItem()}
                </s-grid>

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
            </s-stack>
        </s-page>
    );
}
