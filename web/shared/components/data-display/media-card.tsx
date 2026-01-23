/**
 * Media Card Component
 */
import { useAppNavigation } from "@/shared";

export function MediaCard() {
    const { bundleData } = useAppNavigation();
    return (
        <s-section>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* LEFT SIDE: Video Thumbnail */}
                <s-stack gap="small">
                    <s-heading>Update your plan</s-heading>
                    <s-text>
                        WooCommerce unknown printer took a galley of type and scrambledmake a type specimen book. It has survived not
                        only five centuriestypesetting, remaining essentially
                    </s-text>
                    <s-button
                        variant="secondary"
                        tone="auto"
                        onClick={bundleData.studio}
                    >
                        See details
                    </s-button>
                </s-stack>

                {/* RIGHT SIDE: Info */}
                <div className="relative sm:max-w-[100px] w-full">
                    <s-image
                        borderRadius="large"
                        aspectRatio="1/1"
                        objectFit="cover"
                        alt="Learn about bundling"
                        src="/assets/update-your-plan.svg"
                    />
                </div>
            </div>
        </s-section>
    );
}
