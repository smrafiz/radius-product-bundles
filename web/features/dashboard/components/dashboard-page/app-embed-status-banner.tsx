/**
 * Persistent warning banner when the app embed is not enabled.
 */
export function AppEmbedStatusBanner({
    dismissed,
    appEmbedEnabled,
    shopDomain,
    apiKey,
}: {
    dismissed: boolean;
    appEmbedEnabled: boolean;
    shopDomain: string;
    apiKey: string;
}) {
    if (!dismissed || appEmbedEnabled) {
        return null;
    }

    const themeEditorUrl = `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`;

    return (
        <s-banner tone="warning" heading="App embed is not enabled">
            <s-paragraph>
                The bundle functionalities won&apos;t work correctly on your
                storefront until the app embed is activated in your theme
                editor.
            </s-paragraph>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => window.open(themeEditorUrl, "_blank")}
            >
                Enable app embed
            </s-button>
        </s-banner>
    );
}
