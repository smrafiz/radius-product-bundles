"use client";

import { BUNDLE_HELP_ITEMS } from "@/features/bundles";

export function BundleSelectionHelp() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-stack gap="small-200">
                    <s-heading>Need help choosing?</s-heading>
                    <s-text>
                        Not sure which bundle type is right for your products?
                        Here are some quick guidelines:
                    </s-text>
                </s-stack>

                <s-divider />

                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
                    gap="base"
                    justifyContent="center"
                >
                    {BUNDLE_HELP_ITEMS.map((item, index) => (
                        <s-grid-item key={index} gridColumn="auto">
                            <s-stack gap="small-500">
                                <s-heading>
                                    {item.title}
                                </s-heading>
                                <s-text>
                                    {item.bundles}
                                </s-text>
                            </s-stack>
                        </s-grid-item>
                    ))}
                </s-grid>
            </s-stack>
        </s-section>
    );
}
