/**
 * Top Bundles Header
 */
export function TopBundlesHeader() {
    return (
        <s-box padding="base" border="base" borderStyle="none none solid none">
            <s-stack gap="small-200">
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-heading>Top Performing Bundles</s-heading>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="top-bundle-tooltip"
                    />
                    <s-tooltip id="top-bundle-tooltip">
                        <s-text>
                            Bundles are ranked by total revenue. Low-traffic
                            bundles are excluded to avoid noise. Trends compare
                            current period with previous period of equal length.
                        </s-text>
                    </s-tooltip>
                </s-stack>
            </s-stack>
        </s-box>
    );
}
