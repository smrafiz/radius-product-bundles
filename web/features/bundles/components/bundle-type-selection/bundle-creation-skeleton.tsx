import {
    PageHeaderSkeleton,
    PageSkeleton,
    SkeletonLine,
    SkeletonLines,
} from "@/shared";

/**
 * Bundle creation page skeleton
 */
export function BundleCreationSkeleton({
    mode = "create",
}: {
    mode: "create" | "edit";
}) {
    return (
        <PageSkeleton withPadding={false}>
            <PageHeaderSkeleton
                showBackButton={true}
                heading={mode === "create" ? "Create bundle" : "Edit bundle"}
            />

            <s-stack gap="base">
                <s-section>
                    <div className="flex justify-between w-full">
                        <div className="w-22.5">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-7"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-118.75">
                            <div className="md:col-span-3">
                                <SkeletonLines
                                    lines={1}
                                    random={true}
                                    height="h-7"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <SkeletonLines
                                    lines={1}
                                    random={true}
                                    height="h-7"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <SkeletonLines
                                    lines={1}
                                    random={true}
                                    height="h-7"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <SkeletonLines
                                    lines={1}
                                    random={true}
                                    height="h-7"
                                />
                            </div>
                        </div>
                        <div className="w-22.5">
                            <SkeletonLines
                                lines={1}
                                random={true}
                                height="h-7"
                            />
                        </div>
                    </div>
                </s-section>
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-7">
                            <s-stack gap="base">
                                <s-section>
                                    <div className="w-35 mb-5">
                                        <SkeletonLine
                                            height="h-6"
                                            width={100}
                                            duration={1.5}
                                        />
                                    </div>
                                    <SkeletonLines lines={9} random={true} />
                                </s-section>
                                <s-section>
                                    <div className="w-35 mb-5">
                                        <SkeletonLine
                                            height="h-6"
                                            width={100}
                                            duration={1.5}
                                        />
                                    </div>
                                    <SkeletonLines lines={4} random={true} />
                                </s-section>
                            </s-stack>
                        </div>
                        <div className="md:col-span-5">
                            <s-stack gap="base">
                                <s-section>
                                    <div className="w-35 mb-5">
                                        <SkeletonLine
                                            height="h-6"
                                            width={100}
                                            duration={1.5}
                                        />
                                    </div>
                                    <SkeletonLines lines={1} random={true} />
                                </s-section>
                                <s-section>
                                    <div className="w-35 mb-5">
                                        <SkeletonLine
                                            height="h-6"
                                            width={100}
                                            duration={1.5}
                                        />
                                    </div>
                                    <SkeletonLines lines={1} random={true} />
                                </s-section>
                                <s-section>
                                    <div className="w-35 mb-5">
                                        <SkeletonLine
                                            height="h-6"
                                            width={100}
                                            duration={1.5}
                                        />
                                    </div>
                                    <SkeletonLines lines={10} random={true} />
                                </s-section>
                            </s-stack>
                        </div>
                    </div>
                </div>
            </s-stack>
        </PageSkeleton>
    );
}
