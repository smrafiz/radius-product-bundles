import { Metadata } from "next";
import { SettingsPage } from "@/features/settings/components/settings-page";

export const metadata: Metadata = {
    title: "Settings - Manage Your Bundle Preferences",
    description:
        "Customize your bundle app experience. Configure general settings, analytics preferences, and store integrations to optimize your workflow and performance tracking.",
};

/*
 * Settings Page
 */
export default function Page() {
    return <SettingsPage />;
}
