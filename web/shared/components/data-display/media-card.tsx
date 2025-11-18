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
                <s-grid alignItems="center">
                    <s-stack gap="small">
                        <s-heading>
                            Fast Bundle setup session: boost your success with
                            expert guidance!
                        </s-heading>
                        <s-text>
                            Maximize your success on Shopify with a free
                            30-minute setup session for Fast Bundle. Book now
                            and save valuable time while unlocking powerful
                            product bundling strategies. Our experienced experts
                            will guide you through the process, answer all your
                            questions, and ensure a seamless onboarding
                            experience. Don’t miss out on this opportunity to
                            take your business to the next level!
                        </s-text>
                        <s-button
                            variant="secondary"
                            tone="auto"
                            onClick={bundleData.studio}
                        >
                            Show me some ideas
                        </s-button>
                    </s-stack>
                </s-grid>

                {/* RIGHT SIDE: Info */}
                <div className="relative sm:max-w-[100px] w-full bg-gray-300 p-2 rounded-lg">
                    <s-image
                        borderRadius="large"
                        aspectRatio="1/1"
                        objectFit="cover"
                        alt="Learn about bundling"
                        src="/assets/empty.png"
                    />
                </div>
            </div>
        </s-section>
    );
}
