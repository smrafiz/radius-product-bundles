import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { LegacyCard as Card, Text } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import {
    fetchRegisteredWebhooks,
    ServerActionResult,
} from "@/actions/webhooks.action";

export function WebhookListCard() {
    const app = useAppBridge();
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loadingWebhooks, setLoadingWebhooks] = useState(false);
    const [error, setError] = useState("");
    const [serverActionResult, setServerActionResult] =
        useState<ServerActionResult>();

    const handleFetchWebhooks = async () => {
        setLoadingWebhooks(true);
        setError("");
        setWebhooks([]);
        setServerActionResult(undefined);

        try {
            const token = await app.idToken();
            const result = await fetchRegisteredWebhooks(token);

            if (!result) {
                setError("No response from server.");
                setLoadingWebhooks(false);
                return;
            }

            setServerActionResult(result);

            if (result.status === "success" && result.data) {
                setWebhooks(result.data.webhookSubscriptions.edges);
            } else {
                setError(result.error || "Failed to fetch webhooks.");
            }
        } catch (err) {
            console.error("Webhook fetch failed:", err);
            setError("Something went wrong while fetching webhooks.");
        } finally {
            setLoadingWebhooks(false);
        }
    };

    return (
        <Card
            sectioned
            title="List Registered Webhooks"
            primaryFooterAction={{
                content: loadingWebhooks ? "Loading..." : "List Webhooks",
                onAction: handleFetchWebhooks,
                icon: SearchIcon,
                disabled: loadingWebhooks,
            }}
        >
            <Text as="p" variant="bodyMd">
                Check which webhooks are currently registered to this app.
            </Text>

            {error && (
                <Text as="p" variant="bodyMd" tone="critical">
                    ⚠️ {error}
                </Text>
            )}

            {!error && webhooks.length > 0 && (
                <>
                    <Text as="h3" variant="headingMd" tone="success">
                        ✅ Found {webhooks.length} webhook(s):
                    </Text>
                    <ul style={{ marginTop: "1rem", paddingLeft: "1rem" }}>
                        {webhooks.map((edge, i) => (
                            <li key={edge.node.id}>
                                <Text as="p" variant="bodySm">
                                    🔗 <strong>{edge.node.topic}</strong> →{" "}
                                    {edge.node.endpoint.callbackUrl}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Card>
    );
}
