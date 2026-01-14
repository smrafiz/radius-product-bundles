import {
    useBundleStore,
} from "@/features/bundles";

export function BundlePricing() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return(
        <div className="radius-bundle__pricing"
             style={{
                 fontSize: `${styleData.productFontSize ?? 14}px`,
                 color: styleData.productTextColor || "#303030",
             }}
        >
            <div className="radius-bundle__pricing-row">
                    <span className="radius-bundle__pricing-label">
                        Regular Price:
                    </span>
                <span className="radius-bundle__price-original">$2,899.96</span>
            </div>

            <div className="radius-bundle__pricing-row radius-bundle__pricing-row--highlight">
                    <span className="radius-bundle__pricing-label">
                        Bundle Price:
                    </span>
                <span className="radius-bundle__price-discounted">$1,899.96</span>
            </div>

            <div className="radius-bundle__pricing-row radius-bundle__savings">
                    <span className="radius-bundle__savings-label">
                        You save:
                    </span>
                <span className="radius-bundle__savings-amount">$474.99 (20%)</span>
            </div>

            <div className="radius-bundle__free-shipping">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H21a2 2 0 0 1 2 2v1" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                </svg>
                <span>Free Shipping</span>
            </div>
        </div>
    )
}