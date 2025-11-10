import { BUNDLE_STATUSES} from "@/features/bundles";

export function BundlePreviewStatus() {
    return(
        <s-section>
            <s-heading>Bundle Status</s-heading>
            <s-select label="Bundle Status" value="DRAFT" labelAccessibilityVisibility="exclusive">
                {Object.entries(BUNDLE_STATUSES).map(([key, { text }]) => (
                    <s-option key={key} value={key}>
                        {text}
                    </s-option>
                ))}
            </s-select>
        </s-section>
    );
}