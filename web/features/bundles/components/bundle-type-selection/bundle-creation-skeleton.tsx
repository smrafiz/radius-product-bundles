import { PageHeaderSkeleton, PageSkeleton, SkeletonLines } from "@/shared";

/**
 * Bundle creation page skeleton
 */
export function BundleCreationSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton
                showBackButton={true}
                heading="Create Fixed bundle"
            />

            <s-stack gap="base">
                <s-section>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-6.5"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-6.5"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-6.5"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-6.5"
                            />
                        </div>
                    </div>
                </s-section>
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-7">
                            <s-stack gap="base">
                                <s-section>
                                    <SkeletonLines
                                        lines={5}
                                        random={true}
                                        height="h-4"
                                    />
                                </s-section>
                                <s-section>
                                    <SkeletonLines
                                        lines={13}
                                        random={true}
                                        height="h-5"
                                    />
                                </s-section>
                            </s-stack>
                        </div>
                        <div className="md:col-span-5">
                            <s-stack gap="base">
                                <s-section>
                                    <SkeletonLines
                                        lines={1}
                                        random={true}
                                        height="h-15"
                                    />
                                </s-section>
                                <s-section>
                                    <SkeletonLines
                                        lines={5}
                                        random={true}
                                        height="h-4"
                                    />
                                </s-section>
                                <s-section>
                                    <SkeletonLines
                                        lines={10}
                                        random={true}
                                        height="h-5"
                                    />
                                </s-section>
                            </s-stack>
                        </div>
                    </div>
                </div>
            </s-stack>
        </PageSkeleton>
    );
}
