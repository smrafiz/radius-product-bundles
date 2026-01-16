import { Metadata } from "next";
import {
    CustomizerBundleType,
} from "@/features/settings";
export const metadata: Metadata = {
    title: "Customizer | Manage Your Bundle Customization",
    description:
        "Customize your bundle app experience. Configure general settings, analytics preferences, and store integrations to optimize your workflow and performance tracking.",
};

/*
 * Setting Customizer Page
 */
export default function Page() {

    return <CustomizerBundleType />
}
