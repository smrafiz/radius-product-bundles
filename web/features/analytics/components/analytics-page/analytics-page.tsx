import { AnalyticsTabs } from "@/features/analytics";
import { TitleBar } from "@shopify/app-bridge-react";

export function AnalyticsPage() {
    return (
        <s-page>
            <TitleBar></TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <div className="text-center">
                        <s-heading>
                            <div className="text-base text-center">
                                Bundle Analytics & Customer Insights
                            </div>
                        </s-heading>
                        <s-text color="subdued">
                            Comprehensive insights into your bundle performance
                            and customer behavior.
                        </s-text>
                    </div>
                </s-stack>

                <s-stack gap="base">
                    <AnalyticsTabs />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
