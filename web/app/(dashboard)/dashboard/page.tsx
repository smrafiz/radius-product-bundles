import { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Radius Product Bundles Dashboard",
};

export default function Page() {
    return <DashboardPage />;
}
