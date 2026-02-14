"use client";

import { useAppNavigation } from "@/shared";
import { ROUTES } from "@/shared/constants";

export function DashboardFeatures() {
    const { goTo } = useAppNavigation();

    return (
        <s-section padding="none">
            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                alignItems="center"
                gap="base"
            >
                {/* LEFT SIDE */}
                <s-grid-item gridColumn="auto">
                    <s-image
                        alt="Radius Bundles features"
                        src="/assets/shopbuilder.jpg"
                        aspectRatio="16/9"
                        inlineSize="fill"
                        objectFit="cover"
                    />
                </s-grid-item>
                {/* RIGHT SIDE: Feature highlights */}
                <s-grid-item gridColumn="auto">
                    <s-stack gap="base" padding="base">
                        <s-heading>Powerful Bundle Features</s-heading>
                        <s-unordered-list>
                            <s-list-item>
                                Multiple bundle types — Fixed, BOGO, Volume, Mix
                                & Match
                            </s-list-item>
                            <s-list-item>
                                Flexible discounts — Percentage, fixed amount,
                                custom pricing
                            </s-list-item>
                            <s-list-item>
                                Style customizer — Match your store's branding
                                with zero code
                            </s-list-item>
                            <s-list-item>
                                Built-in analytics — Track views, conversions,
                                and revenue
                            </s-list-item>
                        </s-unordered-list>
                        <s-button
                            variant="primary"
                            onClick={goTo(ROUTES.BUNDLE_CREATE)}
                        >
                            Create a bundle
                        </s-button>
                    </s-stack>
                </s-grid-item>
            </s-grid>
        </s-section>
    );
}
