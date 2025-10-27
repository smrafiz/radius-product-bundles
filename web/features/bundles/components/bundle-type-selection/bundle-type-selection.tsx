"use client";

import {
    BUNDLE_TYPES,
    BundleSelectionHelp,
    BundleTypeCard,
} from "@/features/bundles";
import { useAppNavigation } from "@/shared";
import { CalloutCard, Grid, Layout, Page } from "@shopify/polaris";

export function BundleTypeSelection() {
    const { bundleData, goBack } = useAppNavigation();

    return (
        <Page
            title="Select bundle type"
            subtitle="Choose the type of bundle that best fits your offer"
            backAction={{
                content: "Bundles",
                onAction: goBack,
            }}
        >
            <Layout>
                {/* Bundle Type Cards */}
                <Layout.Section>
                    <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                        {Object.values(BUNDLE_TYPES).map((bundleType) => (
                            <Grid.Cell key={bundleType.id}>
                                <BundleTypeCard bundleType={bundleType} />
                            </Grid.Cell>
                        ))}
                    </Grid>
                </Layout.Section>

                {/* Bundle Studio Callout */}
                <Layout.Section>
                    <CalloutCard
                        title="Need some ideas?"
                        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                        primaryAction={{
                            content: "Show me some ideas",
                            onAction: bundleData.studio,
                        }}
                    >
                        <p>
                            There are several ways to create bundles, we have
                            some suggestions for you to get started.
                        </p>
                    </CalloutCard>
                </Layout.Section>

                {/* Help Section */}
                <Layout.Section>
                    <div className="pb-6">
                        <BundleSelectionHelp />
                    </div>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
