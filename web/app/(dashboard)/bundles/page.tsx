import { Metadata } from "next";
import { BundleListingPage } from "@/features/bundles";

export const metadata: Metadata = {
    title: "Product Bundles - Bundle Manager",
    description:
        "Manage all your product bundles in one place. View performance metrics, edit active offers, track sales, and optimize your bundle campaigns to increase average order value.",
};

/*
 * Bundle Management Page
 */
export default function Page() {
    return <BundleListingPage />;
}
