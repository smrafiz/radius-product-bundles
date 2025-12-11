import { Metadata } from "next";
import { AnalyticsPage } from "@/features/analytics";
export const metadata: Metadata = {
    title: "Analytics | Bundle Performance Dashboard",
    description:
        "Analyze your bundle performance with detailed insights. View revenue, conversions, active bundles, and real-time metrics to optimize your product bundle strategy.",
};
export default function Page() {
    return <AnalyticsPage />
}
