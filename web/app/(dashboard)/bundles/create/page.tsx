import { Metadata } from "next";
import { BundleTypeSelection } from "@/features/bundles";

export const metadata: Metadata = {
    title: "Bundle Creation - Select Bundle Type",
    description:
        "Choose the perfect bundle type for your products. Create fixed bundles, volume discounts, mix & match, BOGO offers, and more to increase sales and average order value.",
};

export default function BundleTypeSelectionPage() {
    return <BundleTypeSelection />;
}
