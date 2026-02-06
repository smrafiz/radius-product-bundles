"use client";

import {
    BUNDLE_TYPES,
    BundleSelectionHelp,
    BundleTypeCard,
} from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import { MediaCard, useAppNavigation } from "@/shared";

export function BundleTypeSelection() {
    const { goBack, bundleData } = useAppNavigation();

    return (
        <s-page>
            <TitleBar>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    Bundles
                </button>
            </TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={() => goBack()}
                            icon="arrow-left"
                            accessibilityLabel="Back"
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Select bundle type</div>
                        </s-heading>
                        <s-text>
                            Choose the type of bundle that best fits your offer
                        </s-text>
                    </s-stack>
                </s-stack>
                <s-stack gap="base">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                        gap="base"
                        justifyContent="center"
                    >
                        {Object.values(BUNDLE_TYPES).map((bundleType) => (
                            <s-grid-item key={bundleType.id} gridColumn="auto">
                                <BundleTypeCard bundleType={bundleType} />
                            </s-grid-item>
                        ))}
                    </s-grid>
                </s-stack>
                <s-stack>
                    <MediaCard />
                </s-stack>
                <s-stack>
                    <BundleSelectionHelp />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
