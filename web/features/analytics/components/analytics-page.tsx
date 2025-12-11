import { AnalyticsMetrics, AnalyticsDate } from "@/features/analytics";

export function AnalyticsPage() {
    return (
        <s-page heading="Analytics">
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack gap="base">
                    <AnalyticsDate />
                    <AnalyticsMetrics />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
