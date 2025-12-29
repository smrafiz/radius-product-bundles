"use client";

import { SkeletonLines } from "@/shared";
import { useAnalytics } from "@/features/analytics";
import { useBundlesData } from "@/features/bundles";

/**
 * AI Insights Component
 */
export function AIInsights({ lines = 4 }: { lines?: number }) {
    const { bundles, isLoading } = useBundlesData();

    if (isLoading) {
        return (
            <s-section padding="base">
                <s-grid
                    gap="small"
                    gridTemplateColumns="1fr auto"
                    paddingBlockEnd="large"
                >
                    <s-stack>
                        <s-heading>🤖 AI Insights</s-heading>
                    </s-stack>
                    <s-stack>
                        <s-badge tone="info">Beta</s-badge>
                    </s-stack>
                </s-grid>
                <s-box>
                    <div className="animate-pulse space-y-3">
                        <SkeletonLines lines={lines} random={true} />
                    </div>
                </s-box>
            </s-section>
        );
    }

    if (!bundles || bundles.length === 0) {
        return (
            <s-section padding="base">
                <s-grid
                    gap="small"
                    gridTemplateColumns="1fr auto"
                    paddingBlockEnd="large"
                >
                    <s-stack>
                        <s-heading>🤖 AI Insights</s-heading>
                    </s-stack>
                    <s-stack>
                        <s-badge tone="info">Beta</s-badge>
                    </s-stack>
                </s-grid>
                <s-box padding="base" background="subdued" borderRadius="base">
                    <s-text>
                        To access AI insights, please create at least one
                        bundle.
                    </s-text>
                </s-box>
            </s-section>
        );
    }

    return (
        <s-section>
            <s-grid
                gap="small"
                gridTemplateColumns="1fr auto"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <s-heading>🤖 AI Insights</s-heading>
                </s-stack>
                <s-stack>
                    <s-badge tone="info">Beta</s-badge>
                </s-stack>
            </s-grid>
            <div className="bg-linear-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <s-stack gap="base">
                    <s-heading>💡 Bundle Performance Analysis</s-heading>
                    <s-text>
                        Based on your current bundles, we&apos;ve identified
                        optimization opportunities. Click &quot;Analyze
                        Bundles&quot; to get personalized recommendations for
                        improving conversion rates.
                    </s-text>
                    <s-stack direction="inline" gap="small-200">
                        <s-button variant="primary">Analyze Bundles</s-button>
                        <s-button variant="secondary">Learn More</s-button>
                    </s-stack>
                </s-stack>
            </div>
        </s-section>
    );
}
