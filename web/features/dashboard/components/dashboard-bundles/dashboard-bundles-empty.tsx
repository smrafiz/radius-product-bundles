"use client";
import { useAppNavigation } from "@/shared";

export function DashboardBundlesEmpty({
    error,
}: {
    error?: string | null;
}) {
    const { bundleData } = useAppNavigation();

    const heading = error
        ? "Unable to load bundles"
        : "No active bundles";

    const description = error
        ? "Something went wrong while loading your bundles. Please try refreshing the page."
        : "Create and activate a bundle to see it here.";

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
                    <s-stack
                        alignItems="center"
                        justifyContent="center"
                        gap="small-300"
                    >
                        <s-heading>{heading}</s-heading>
                        <s-paragraph>
                            <div className="text-center">{description}</div>
                        </s-paragraph>
                    </s-stack>
                    {!error && (
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel="Create Bundle"
                            onClick={bundleData.create()}
                        >
                            Create Bundle
                        </s-button>
                    )}
                </s-grid>
            </s-grid>
        </s-section>
    );
}
