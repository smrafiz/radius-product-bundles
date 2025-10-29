"use client";
import { useAppNavigation } from "@/shared";
/*
 * Dashboard bundles empty state
 */
export function DashboardBundlesEmpty({ error }: { error?: string | null }) {
    const { bundleData } = useAppNavigation();

    return (
        <s-section accessibilityLabel="Empty state section">
            <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
                <s-box maxInlineSize="200px" maxBlockSize="200px">
                    <s-image
                        aspectRatio="1/1"
                        src="/assets/empty.png"
                        alt="A stylized graphic of four characters, each holding a puzzle piece"
                    />
                </s-box>
                <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
                    <s-stack alignItems="center">
                        <s-heading>
                            {error
                                ? "Unable to load bundles"
                                : "No bundles created yet"}
                        </s-heading>
                        <s-paragraph>
                            {error
                                ? "Something went wrong while loading your bundles. Please try refreshing the page."
                                : "Get started by creating your first bundle to manage product offers."}
                        </s-paragraph>
                    </s-stack>
                    <s-button
                        icon="plus"
                        variant="primary"
                        accessibilityLabel="Create Bundle"
                        onClick={bundleData.create()}
                    >
                        Create Bundle
                    </s-button>
                </s-grid>
            </s-grid>
        </s-section>
    );
}
