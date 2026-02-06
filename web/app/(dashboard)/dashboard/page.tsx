import { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard";

export const metadata: Metadata = {
    title: "Dashboard - Product Bundles Overview",
    description:
        "View your bundle performance at a glance. Track revenue, conversion rates, active bundles, and key metrics. Monitor your product bundle campaigns and optimize for maximum sales growth.",
};

/*
 * Dashboard Page
 */
export default function Page() {
    return <DashboardPage />;
}
