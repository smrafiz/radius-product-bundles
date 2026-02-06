import { Metadata } from "next";
import { PricingPage } from "@/features/pricing";

export const metadata: Metadata = {
    title: "Pricing - Flexible Plans for Every Business",
    description:
        "Choose the perfect plan for your store. Compare features, bundle limits, and analytics access. Start free and upgrade anytime to unlock advanced bundle performance insights and premium support.",
};

/*
 * Pricing Page
 */
export default function Page() {
    return <PricingPage />;
}
