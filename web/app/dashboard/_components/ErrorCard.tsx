import { Box, Button, Card, InlineStack, Text } from "@shopify/polaris";

interface ErrorCardProps {
    error: string;
    onRetry?: () => void;
}

export const ErrorCard = ({ error, onRetry }: ErrorCardProps) => {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <Card>
            <Box padding="400">
                <InlineStack align="center">
                    <Text as="p" variant="bodyMd" tone="critical">
                        {error}
                    </Text>
                    <Button size="slim" onClick={handleRetry}>
                        Retry
                    </Button>
                </InlineStack>
            </Box>
        </Card>
    );
};
