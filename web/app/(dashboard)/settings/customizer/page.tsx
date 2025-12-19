import { Metadata } from "next";
import {
    CustomizerOptions,
    CustomizerBundlePreview,
    CustomizerHeader,
} from "@/features/settings";
export const metadata: Metadata = {
    title: "Settings | Manage Your Bundle Preferences",
    description:
        "Customize your bundle app experience. Configure general settings, analytics preferences, and store integrations to optimize your workflow and performance tracking.",
};

/*
 * Setting Customizer Page
 */
export default function Page() {
    return (
        <div className="rtbp-full-modal-editor">
            <div className="rtbp-full-content">
                <div className="rtbp-left-setting">
                    <CustomizerOptions />
                </div>
                <div className="rtbp-right-review">
                    <s-stack gap="base">
                        <CustomizerHeader />
                        <CustomizerBundlePreview />
                    </s-stack>
                </div>
            </div>
        </div>
    );
}
