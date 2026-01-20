import { BundleTypeTab } from "@/features/settings";

interface Props {
    activeBundleType: string;
    onBundleTypeChange: (id: string) => void;
}

export function CustomizerHeader({
    activeBundleType,
    onBundleTypeChange,
}: Props) {
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
