import { Metadata } from "next";
import {
    CustomizerBundleType,
    CustomizerPreview,
    CustomizerHeader,
    BundleOptionType,
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
            <div className="rtpb-full-modal-content flex flex-wrap gap-6">
                {/* Left option */}
                <div className="rtpb-left-setting border border-[#e3e3e3] bg-white rounded-xl overflow-hidden">
                    <BundleOptionType />
                </div>
                {/* Right review */}
                <div className="rtpb-right-review">
                    <s-stack gap="base">
                        <CustomizerHeader />
                        <CustomizerPreview />
                        <CustomizerBundleType />
                    </s-stack>
                </div>
            </div>
        </div>
    );
}
