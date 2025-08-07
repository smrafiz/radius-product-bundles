import {
    BlockStack,
    Box,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import {
    AutomationIcon,
    ChartVerticalIcon,
    PlusIcon,
    SandboxIcon,
} from "@shopify/polaris-icons";

export const QuickActions = () => {
    return (
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
                        <Button icon={SandboxIcon} url="/ab-testing">
                            Run A/B Test
                        </Button>
                        <Button icon={AutomationIcon} url="/automation">
                            Setup Automation
                        </Button>
                        <Button icon={ChartVerticalIcon} url="/analytics">
                            View Analytics
                        </Button>
                    </InlineStack>
                </BlockStack>
            </Box>
        </Card>
    );
};
