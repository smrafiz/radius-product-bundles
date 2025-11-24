"use client";
import { MediaCard } from "@/shared";
import {
    BUNDLE_TYPES,
    BundleSelectionHelp,
    BundleTypeCard,
} from "@/features/bundles";
import { useAppNavigation } from "@/shared";

export function BundleTypeSelection() {
    const { goBack } = useAppNavigation();

    return (
        <s-page heading="Select Bundle Type">
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
