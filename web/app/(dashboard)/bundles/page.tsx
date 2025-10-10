import { Metadata } from "next";
import { BundleListingPage } from "@/features/bundles";

export const metadata: Metadata = {
    title: "Bundle Management",
    description: "Create and manage your product bundle offers",
};

export default function Page() {
    return <BundleListingPage />;
}
