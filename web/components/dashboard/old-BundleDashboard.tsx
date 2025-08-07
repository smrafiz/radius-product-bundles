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
    Page,
    ProgressBar,
    ResourceItem,
    ResourceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonPage,
    Text,
    Toast,
} from "@shopify/polaris";
import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    AutomationIcon,
    ChartVerticalIcon,
    PlusIcon,
    SandboxIcon,
} from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getBundleMetrics, getBundles } from "@/actions/bundles.action";
import type {
    Bundle,
    BundleStatus,
    BundleStatusBadge,
    DashboardMetrics,
    GrowthTone,
} from "@/types";

// Skeleton Components for better loading UX
const MetricCardSkeleton = () => (
    <Card>
        <Box padding="400">
            <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonDisplayText size="large" />
                <InlineStack align="space-between">
                    <SkeletonBodyText lines={1} />
                    <SkeletonBodyText lines={1} />
                </InlineStack>
            </BlockStack>
        </Box>
    </Card>
);

const BundleListSkeleton = () => (
    <Card>
        <Box padding="400">
            <BlockStack gap="300">
                {[1, 2, 3].map((i) => (
                    <InlineStack key={i} gap="300">
                        <Box>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                        </Box>
                        <BlockStack gap="100">
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText lines={2} />
                            <div className="w-full h-2 bg-gray-200 rounded animate-pulse" />
                        </BlockStack>
                    </InlineStack>
                ))}
            </BlockStack>
        </Box>
    </Card>
);

export default function OldBundleDashboard() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [toastActive, setToastActive] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>("");

    const app = useAppBridge();

    useEffect(() => {
        let mounted = true;

        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await app.idToken();

                // Load data in parallel for better performance
                const [bundlesResult, metricsResult] = await Promise.all([
                    getBundles(token),
                    getBundleMetrics(token),
                ]);

                // Only update state if component is still mounted
                if (!mounted) return;

                if (bundlesResult.status === "success") {
                    setBundles(bundlesResult.data || []);
                } else {
                    console.error(
                        "Failed to load bundles:",
                        bundlesResult.message,
                    );
                    setError(bundlesResult.message || "Failed to load bundles");
                }

                if (metricsResult.status === "success") {
                    const data = metricsResult.data;
                    setMetrics({
                        totalRevenue: data.totals?.revenue || 0,
                        totalViews: data.totals?.views || 0,
                        avgConversionRate: data.metrics?.conversionRate || 0,
                        totalBundles: bundlesResult.data?.length || 0,
                        revenueGrowth: data.growth?.revenue || 0,
                        conversionGrowth: data.growth?.conversion || 0,
                    });
                } else {
                    console.error(
                        "Failed to load metrics:",
                        metricsResult.message,
                    );
                    // Don't set error for metrics - show empty state instead
                    setMetrics({
                        totalRevenue: 0,
                        totalViews: 0,
                        avgConversionRate: 0,
                        totalBundles: 0,
                        revenueGrowth: 0,
                        conversionGrowth: 0,
                    });
                }
            } catch (err) {
                if (!mounted) return;

                console.error("Dashboard load error:", err);
                setError("Failed to load dashboard data");
                showToast("Failed to load dashboard data");

                // Set empty state on error
                setBundles([]);
                setMetrics({
                    totalRevenue: 0,
                    totalViews: 0,
                    avgConversionRate: 0,
                    totalBundles: 0,
                    revenueGrowth: 0,
                    conversionGrowth: 0,
                });
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadDashboardData();

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            mounted = false;
        };
    }, [app]);

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

    const formatGrowth = (value: number) => {
        const prefix = value >= 0 ? "+" : "";
        return `${prefix}${value.toFixed(1)}%`;
    };

    const getBundleStatusBadge = (status: BundleStatus): BundleStatusBadge => {
        const statusMap: Record<BundleStatus, BundleStatusBadge> = {
            DRAFT: { status: "info", children: "Draft" },
            ACTIVE: { status: "success", children: "Active" },
            PAUSED: { status: "warning", children: "Paused" },
            ARCHIVED: { status: "critical", children: "Archived" },
            SCHEDULED: { status: "info", children: "Scheduled" },
        };
        return statusMap[status] || { status: "info", children: status };
    };

    const getGrowthIcon = (value: number) => {
        if (value > 0) {
            return ArrowUpIcon;
        }
        if (value < 0) {
            return ArrowDownIcon;
        }
        return ArrowRightIcon;
    };

    const getGrowthTone = (value: number): GrowthTone => {
        if (value >= 50) {
            return "success";
        }

        if (value >= 10) {
            return "caution";
        }

        return "subdued";
    };

    const formatBundleType = (type: string) => {
        return type
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Show skeleton loading state
    if (loading) {
        return (
            <SkeletonPage primaryAction title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCardSkeleton />
                            <MetricCardSkeleton />
                            <MetricCardSkeleton />
                            <MetricCardSkeleton />
                        </div>
                    </Layout.Section>
                    <Layout.Section>
                        <BundleListSkeleton />
                    </Layout.Section>
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <SkeletonBodyText lines={3} />
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        );
    }

    return (
        <Frame>
            <Page
                title="Dashboard"
                subtitle="Welcome to Radius Product Bundles"
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
                    {/* Error State */}
                    {error && (
                        <Layout.Section>
                            <Card>
                                <Box padding="400">
                                    <InlineStack align="center">
                                        <Text
                                            as="p"
                                            variant="bodyMd"
                                            tone="critical"
                                        >
                                            {error}
                                        </Text>
                                        <Button
                                            size="slim"
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Retry
                                        </Button>
                                    </InlineStack>
                                </Box>
                            </Card>
                        </Layout.Section>
                    )}

                    {/* Key Metrics Row */}
                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text
                                            as="h3"
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Total Revenue
                                        </Text>
                                        <Text as="p" variant="heading2xl">
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
                                                    source={getGrowthIcon(
                                                        metrics?.revenueGrowth ||
                                                            0,
                                                    )}
                                                    tone={getGrowthTone(
                                                        metrics?.revenueGrowth ||
                                                            0,
                                                    )}
                                                />
                                                <Text
                                                    as="span"
                                                    variant="bodySm"
                                                    tone={getGrowthTone(
                                                        metrics?.revenueGrowth ||
                                                            0,
                                                    )}
                                                >
                                                    {formatGrowth(
                                                        metrics?.revenueGrowth ||
                                                            0,
                                                    )}
                                                </Text>
                                            </InlineStack>
                                            <Text
                                                as="span"
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
                                            as="h3"
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Conversion Rate
                                        </Text>
                                        <Text as="p" variant="heading2xl">
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
                                                    source={getGrowthIcon(
                                                        metrics?.conversionGrowth ||
                                                            0,
                                                    )}
                                                    tone={getGrowthTone(
                                                        metrics?.conversionGrowth ||
                                                            0,
                                                    )}
                                                />
                                                <Text
                                                    as="span"
                                                    variant="bodySm"
                                                    tone={getGrowthTone(
                                                        metrics?.conversionGrowth ||
                                                            0,
                                                    )}
                                                >
                                                    {formatGrowth(
                                                        metrics?.conversionGrowth ||
                                                            0,
                                                    )}
                                                </Text>
                                            </InlineStack>
                                            <Text
                                                as="span"
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
                                            as="h3"
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Active Bundles
                                        </Text>
                                        <Text as="p" variant="heading2xl">
                                            {metrics?.totalBundles || 0}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <Text
                                                as="span"
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
                                            as="h3"
                                            variant="headingMd"
                                            tone="subdued"
                                        >
                                            Total Views
                                        </Text>
                                        <Text as="p" variant="heading2xl">
                                            {(
                                                metrics?.totalViews || 0
                                            ).toLocaleString()}
                                        </Text>
                                        <InlineStack align="space-between">
                                            <Text
                                                as="span"
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
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <InlineStack align="space-between">
                                        <Text as="h2" variant="headingMd">
                                            Top Performing Bundles
                                        </Text>
                                        <Button variant="plain" url="/bundles">
                                            View All Bundles
                                        </Button>
                                    </InlineStack>
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
                                                                    as="span"
                                                                    variant="headingSm"
                                                                    tone="text-inverse"
                                                                >
                                                                    {name
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </Text>
                                                            </div>
                                                        }
                                                    >
                                                        <BlockStack gap="100">
                                                            <InlineStack align="space-between">
                                                                <Text
                                                                    as="h3"
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
                                                                    as="span"
                                                                    variant="bodySm"
                                                                    tone="subdued"
                                                                >
                                                                    {formatBundleType(
                                                                        type,
                                                                    )}{" "}
                                                                    •{" "}
                                                                    {
                                                                        productCount
                                                                    }{" "}
                                                                    products
                                                                </Text>
                                                            </InlineStack>
                                                            <InlineStack gap="400">
                                                                <Text
                                                                    as="span"
                                                                    variant="bodySm"
                                                                >
                                                                    <strong>
                                                                        {formatPercentage(
                                                                            conversionRate,
                                                                        )}
                                                                    </strong>{" "}
                                                                    conversion
                                                                </Text>
                                                                <Text
                                                                    as="span"
                                                                    variant="bodySm"
                                                                >
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
                                                                    conversionRate *
                                                                        10,
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
                                            <BlockStack
                                                gap="300"
                                                align="center"
                                            >
                                                <Text
                                                    as="p"
                                                    variant="bodyMd"
                                                    tone="subdued"
                                                >
                                                    {error
                                                        ? "Unable to load bundles"
                                                        : "No bundles created yet"}
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
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>

                    {/* Quick Actions */}
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <Text as="h2" variant="headingMd">
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

                    {/* AI Insights Card - Only show if we have data */}
                    {bundles.length > 0 && (
                        <Layout.Section>
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="400">
                                        <InlineStack align="space-between">
                                            <Text as="h2" variant="headingMd">
                                                🤖 AI Insights
                                            </Text>
                                            <Badge tone="info">Beta</Badge>
                                        </InlineStack>
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                                            <BlockStack gap="200">
                                                <Text
                                                    as="h3"
                                                    variant="bodyMd"
                                                    fontWeight="medium"
                                                >
                                                    💡 Bundle Performance
                                                    Analysis
                                                </Text>
                                                <Text as="p" variant="bodyMd">
                                                    Based on your current
                                                    bundles, we&apos;ve identified
                                                    optimization opportunities.
                                                    Click &quot;Analyze Bundles&quot; to
                                                    get personalized
                                                    recommendations for
                                                    improving conversion rates.
                                                </Text>
                                                <InlineStack gap="200">
                                                    <Button
                                                        size="slim"
                                                        variant="primary"
                                                    >
                                                        Analyze Bundles
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
                    )}
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
