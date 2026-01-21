import { BundleTypeTab } from "@/features/settings";

/*
 * Customizer Header
 */
export function CustomizerHeader({
    activeBundleType,
    onBundleTypeChange,
}: {
    activeBundleType: string;
    onBundleTypeChange: (id: string) => void;
}) {
    return (
        <s-section>
            <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
                gap="base"
            >
                <BundleTypeTab
                    activeId={activeBundleType}
                    onChange={onBundleTypeChange}
                />

                <s-button-group gap="none">
                    <s-button slot="secondary-actions">Desktop</s-button>
                    <s-button slot="secondary-actions">Tablet</s-button>
                    <s-button slot="secondary-actions">Mobile</s-button>
                </s-button-group>
            </s-stack>
        </s-section>
    );
}
