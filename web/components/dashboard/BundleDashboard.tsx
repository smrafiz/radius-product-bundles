"use client";

import React, { useEffect, useState } from "react";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Frame,
    Icon,
    InlineStack,
    Layout,
    LegacyCard,
    Page,
    ProgressBar,
    ResourceItem,
    ResourceList,
    Text,
    Toast,
} from "@shopify/polaris";
import {
    ChartVerticalIcon,
    AutomationIcon,
    PlusIcon,
    SandboxIcon,
    ProductIcon,
} from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getBundleMetrics, getBundles } from "@/actions/bundles.action";

interface Bundle {
    id: string;
    name: string;
    type: string;
    status: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
}

interface DashboardMetrics {
    totalRevenue: number;
    totalViews: number;
    avgConversionRate: number;
    totalBundles: number;
}

export default function BundleDashboard() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [toastActive, setToastActive] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const app = useAppBridge();

    useEffect(() => {
        void loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const token = await app.idToken();

            // Load bundles and metrics
            const [bundlesResult, metricsResult] = await Promise.all([
                getBundles(token),
                getBundleMetrics(token),
            ]);

            if (bundlesResult.status === "success") {
                setBundles(bundlesResult.data || []);
            }

            if (metricsResult.status === "success") {
                const data = metricsResult.data;
                setMetrics({
                    totalRevenue: data.totals.revenue,
                    totalViews: data.totals.views,
                    avgConversionRate: data.metrics.conversionRate,
                    totalBundles: bundlesResult.data?.length || 0,
                });
            }
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            showToast("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastActive(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    const getBundleStatusBadge = (status: string) => {
        const statusMap = {
            ACTIVE: { status: "success" as const, children: "Active" },
            DRAFT: { status: "info" as const, children: "Draft" },
            PAUSED: { status: "warning" as const, children: "Paused" },
            ARCHIVED: { status: "critical" as const, children: "Archived" },
        };
        return (
            statusMap[status as keyof typeof statusMap] || {
                status: "info" as const,
                children: status,
            }
        );
    };

    if (loading) {
        return (
            <Page title="Dashboard" subtitle="Welcome to Bundle Pro">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <InlineStack align="center">
                                    <Text variant="bodyMd">
                                        Loading dashboard data...
                                    </Text>
                                </InlineStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Frame>
            <Page
                title="Dashboard"
                subtitle="Welcome to Bundle Pro"
                primaryAction={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    url: "/bundles/create",
                }}
                secondaryActions={[
                    {
                        content: "View Analytics",
                        icon: ChartVerticalIcon,
                        url: "/analytics",
                    },
                    {
                        content: "Run A/B Test",
                        icon: SandboxIcon,
                        url: "/ab-testing",
                    },
                ]}
            >
                <Layout>
                    {/* Key Metrics Row */}
                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Total Revenue
                                        </Text>
                                        <Text variant="heading2xl">
                                            {formatCurrency(
                                                metrics?.totalRevenue || 0,
                                            )}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <InlineStack
                                                gap="100"
                                                align="center"
                                            >
                                                <Icon
                                                    source={ProductIcon}
                                                    tone="success"
                                                />
                                                <Text
                                                    variant="bodySm"
                                                    tone="success"
                                                >
                                                    +12.5%
                                                </Text>
                                            </InlineStack>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                            >
                                                vs last month
                                            </Text>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </Card>

                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Conversion Rate
                                        </Text>
                                        <Text variant="heading2xl">
                                            {formatPercentage(
                                                metrics?.avgConversionRate || 0,
                                            )}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <InlineStack
                                                gap="100"
                                                align="center"
                                            >
                                                <Icon
                                                    source={ProductIcon}
                                                    tone="success"
                                                />
                                                <Text
                                                    variant="bodySm"
                                                    tone="success"
                                                >
                                                    +8.3%
                                                </Text>
                                            </InlineStack>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                            >
                                                vs last month
                                            </Text>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </Card>

                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Active Bundles
                                        </Text>
                                        <Text variant="heading2xl">
                                            {metrics?.totalBundles || 0}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                            >
                                                Total created
                                            </Text>
                                            <Button
                                                variant="plain"
                                                size="slim"
                                                url="/bundles"
                                            >
                                                View all
                                            </Button>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </Card>

                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Total Views
                                        </Text>
                                        <Text variant="heading2xl">
                                            {(
                                                metrics?.totalViews || 0
                                            ).toLocaleString()}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                            >
                                                Last 30 days
                                            </Text>
                                            <Button
                                                variant="plain"
                                                size="slim"
                                                url="/analytics"
                                            >
                                                View details
                                            </Button>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </Card>
                        </div>
                    </Layout.Section>

                    {/* Top Performing Bundles */}
                    <Layout.Section>
                        <LegacyCard
                            title="Top Performing Bundles"
                            sectioned={false}
                            primaryFooterAction={{
                                content: "View All Bundles",
                                url: "/bundles",
                            }}
                        >
                            {bundles.length > 0 ? (
                                <ResourceList
                                    resourceName={{
                                        singular: "bundle",
                                        plural: "bundles",
                                    }}
                                    items={bundles}
                                    renderItem={(bundle) => {
                                        const {
                                            id,
                                            name,
                                            type,
                                            status,
                                            conversionRate,
                                            revenue,
                                            productCount,
                                        } = bundle;
                                        return (
                                            <ResourceItem
                                                id={id}
                                                url={`/bundles/${id}`}
                                                media={
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <Text
                                                            variant="headingSm"
                                                            tone="text-inverse"
                                                        >
                                                            {name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </Text>
                                                    </div>
                                                }
                                            >
                                                <BlockStack gap="100">
                                                    <InlineStack align="space-between">
                                                        <Text
                                                            variant="bodyMd"
                                                            fontWeight="semibold"
                                                        >
                                                            {name}
                                                        </Text>
                                                        <Badge
                                                            {...getBundleStatusBadge(
                                                                status,
                                                            )}
                                                        />
                                                    </InlineStack>
                                                    <InlineStack gap="400">
                                                        <Text
                                                            variant="bodySm"
                                                            tone="subdued"
                                                        >
                                                            {type.replace(
                                                                /_/g,
                                                                " ",
                                                            )}{" "}
                                                            • {productCount}{" "}
                                                            products
                                                        </Text>
                                                    </InlineStack>
                                                    <InlineStack gap="400">
                                                        <Text variant="bodySm">
                                                            <strong>
                                                                {formatPercentage(
                                                                    conversionRate,
                                                                )}
                                                            </strong>{" "}
                                                            conversion
                                                        </Text>
                                                        <Text variant="bodySm">
                                                            <strong>
                                                                {formatCurrency(
                                                                    revenue,
                                                                )}
                                                            </strong>{" "}
                                                            revenue
                                                        </Text>
                                                    </InlineStack>
                                                    <ProgressBar
                                                        progress={Math.min(
                                                            conversionRate * 10,
                                                            100,
                                                        )}
                                                        size="small"
                                                    />
                                                </BlockStack>
                                            </ResourceItem>
                                        );
                                    }}
                                />
                            ) : (
                                <Box padding="400">
                                    <BlockStack gap="300" align="center">
                                        <Text variant="bodyMd" tone="subdued">
                                            No bundles created yet
                                        </Text>
                                        <Button
                                            variant="primary"
                                            icon={PlusIcon}
                                            url="/bundles/create"
                                        >
                                            Create Your First Bundle
                                        </Button>
                                    </BlockStack>
                                </Box>
                            )}
                        </LegacyCard>
                    </Layout.Section>

                    {/* Quick Actions */}
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <Text variant="headingMd">
                                        Quick Actions
                                    </Text>
                                    <InlineStack gap="300" wrap={false}>
                                        <Button
                                            variant="primary"
                                            icon={PlusIcon}
                                            url="/bundles/create"
                                        >
                                            Create Bundle
                                        </Button>
                                        <Button
                                            icon={SandboxIcon}
                                            url="/ab-testing"
                                        >
                                            Run A/B Test
                                        </Button>
                                        <Button
                                            icon={AutomationIcon}
                                            url="/automation"
                                        >
                                            Setup Automation
                                        </Button>
                                        <Button
                                            icon={ChartVerticalIcon}
                                            url="/analytics"
                                        >
                                            View Analytics
                                        </Button>
                                    </InlineStack>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>

                    {/* AI Insights Card */}
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <InlineStack align="space-between">
                                        <Text variant="headingMd">
                                            🤖 AI Insights
                                        </Text>
                                        <Badge tone="info">Beta</Badge>
                                    </InlineStack>
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                                        <BlockStack gap="200">
                                            <Text
                                                variant="bodyMd"
                                                fontWeight="medium"
                                            >
                                                💡 Opportunity Detected
                                            </Text>
                                            <Text variant="bodyMd">
                                                Customers who buy your "Tech
                                                Essentials" bundle often
                                                purchase phone accessories.
                                                Consider creating a cross-sell
                                                bundle with{" "}
                                                <strong>
                                                    67% correlation confidence
                                                </strong>
                                                .
                                            </Text>
                                            <InlineStack gap="200">
                                                <Button
                                                    size="slim"
                                                    variant="primary"
                                                >
                                                    Apply Suggestion
                                                </Button>
                                                <Button size="slim">
                                                    Learn More
                                                </Button>
                                            </InlineStack>
                                        </BlockStack>
                                    </div>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>

                {/* Toast notifications */}
                {toastActive && (
                    <Toast
                        content={toastMessage}
                        onDismiss={() => setToastActive(false)}
                    />
                )}
            </Page>
        </Frame>
    );
}
