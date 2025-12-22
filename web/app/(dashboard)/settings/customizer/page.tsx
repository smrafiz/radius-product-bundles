import { Metadata } from "next";
import {
    CustomizerBundleTab,
    CustomizerHeader,
    BundleOptionsType,
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
    return (
        <div className="rtpb-full-modal-editor">
            <div className="rtpb-full-content flex flex-wrap gap-6">
                {/* Left option */}
                <div className="rtpb-left-setting lg:w-[380px]">
                    <BundleOptionsType />
                </div>
                {/* Right review */}
                <div className="rtpb-right-review">
                    <s-stack gap="base">
                        <CustomizerHeader />
                        <CustomizerBundleTab />
                    </s-stack>
                </div>
            </div>
        </div>
    );
}
