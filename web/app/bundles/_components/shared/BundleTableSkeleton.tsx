"use client";

import { Box, Card, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";

export default function BundleTableSkeleton() {
    return (
        <Card>
            <Box padding="400">
                <SkeletonDisplayText size="small" maxWidth="20ch" />
                <div className="mt-4 space-y-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <SkeletonBodyText key={row} lines={1} />
                    ))}
                </div>
            </Box>
        </Card>
    );
}