"use client";

import {
    Box,
    Card,
    SkeletonBodyText,
    SkeletonDisplayText,
} from "@shopify/polaris";

export function BundleTableSkeleton() {
    return (
        <s-section>
            <s-stack padding="400">
                {/*<SkeletonDisplayText size="small" maxWidth="20ch" />*/}
                {/*<div className="mt-4 space-y-4 animate-pulse">*/}
                {/*    {[1, 2, 3, 4, 5,6,7,8].map((row) => (*/}
                {/*        <SkeletonBodyText key={row} lines={1} />*/}
                {/*    ))}*/}
                {/*</div>*/}
                <s-spinner accessibilityLabel="Loading" size="large-100" />
            </s-stack>
        </s-section>
    );
}
