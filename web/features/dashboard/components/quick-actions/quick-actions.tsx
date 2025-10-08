"use client";

import { useRouter } from "next/navigation";
import {
    BlockStack,
    Box,
    Card,
    Grid,
    Icon,
    InlineStack,
    Text,
} from "@shopify/polaris";
import {
    ChartVerticalIcon,
    OrderIcon,
    SandboxIcon,
} from "@shopify/polaris-icons";
import { withLoader } from "@/utils";

interface QuickActionItem {
    title: string;
    description: string;
    icon: any;
    url: string;
    backgroundColor: string;
    iconColor?: "success" | "critical" | "info";
}

const quickActions: QuickActionItem[] = [
    {
        title: "Manage Bundle",
        description: "Create and edit bundle offers",
        icon: OrderIcon,
        url: "/bundles",
        backgroundColor: "var(--p-color-bg-surface-success-hover)",
        iconColor: "success",
    },
    {
        title: "View Analytics",
        description: "Track performance metrics",
        icon: ChartVerticalIcon,
        url: "/analytics",
        backgroundColor: "var(--p-color-bg-surface-info-hover)",
        iconColor: "info",
    },
    {
        title: "Bundle Studio",
        description: "Create just like the templates",
        icon: SandboxIcon,
        url: "/templates",
        backgroundColor: "var(--p-color-bg-surface-critical-hover)",
        iconColor: "critical",
    },
];

export const QuickActions = () => {
    const router = useRouter();

    const handleNavigate = (url: string) =>
        withLoader(() => router.push(url));

    return (
        <div className="radius-quick-actions-wrapper">
            <Card>
                <Box padding="400">
                    <BlockStack gap="400">
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingMd">
                                Quick Actions
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                                Common tasks and shortcuts for managing your
                                product bundles
                            </Text>
                        </BlockStack>

                        <Grid>
                            {quickActions.map((action, index) => (
                                <Grid.Cell
                                    key={index}
                                    columnSpan={{
                                        xs: 6,
                                        sm: 4,
                                        md: 4,
                                        lg: 4,
                                        xl: 4,
                                    }}
                                >
                                    <div
                                        className="radius-quick-action-item"
                                        onClick={() =>
                                            handleNavigate(action.url)
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="transition-all hover:-translate-y-[3px]">
                                            <Card>
                                                <Box padding="300">
                                                    <InlineStack
                                                        gap="300"
                                                        align="start"
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-[var(--p-border-radius-150)] flex items-center justify-center"
                                                            style={{
                                                                backgroundColor:
                                                                action.backgroundColor,
                                                            }}
                                                        >
                                                            <div className="radius-quick-action-icon">
                                                                <Icon
                                                                    source={
                                                                        action.icon
                                                                    }
                                                                    tone={
                                                                        action.iconColor
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <BlockStack gap="100">
                                                            <Text
                                                                as="h3"
                                                                variant="bodyMd"
                                                                fontWeight="medium"
                                                            >
                                                                {action.title}
                                                            </Text>
                                                            <Text
                                                                as="p"
                                                                variant="bodySm"
                                                                tone="subdued"
                                                            >
                                                                {action.description}
                                                            </Text>
                                                        </BlockStack>
                                                    </InlineStack>
                                                </Box>
                                            </Card>
                                        </div>
                                    </div>
                                </Grid.Cell>
                            ))}
                        </Grid>
                    </BlockStack>
                </Box>
            </Card>
        </div>
    );
};