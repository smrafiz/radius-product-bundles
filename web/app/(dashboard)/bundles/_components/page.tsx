import { Metadata } from "next";
import { BundleListingPage } from "@/features/bundles";

export const metadata: Metadata = {
    title: "Bundles",
    description: "All Bundles List",
};

export default function Page() {
    return <BundleListingPage />;
}
