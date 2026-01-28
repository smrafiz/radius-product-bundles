"use client";

import { BundleTypeTab } from "@/features/settings";

export function CustomizerHeader({
    activeBundleType,
    onBundleTypeChangeAction,
}: {
    activeBundleType: string;
    onBundleTypeChangeAction: (id: string) => void;
}) {
    return (
        <div className="w-full border border-[#e3e3e3] rounded-xl overflow-hidden">
            <s-section>
                <s-stack
                    direction="inline"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="base"
                >
                    <BundleTypeTab
                        activeId={activeBundleType}
                        onChangeAction={onBundleTypeChangeAction}
                    />

                    <s-button-group gap="none">
                        <s-button slot="secondary-actions">Desktop</s-button>
                        <s-button slot="secondary-actions">Tablet</s-button>
                        <s-button slot="secondary-actions">Mobile</s-button>
                    </s-button-group>
                </s-stack>
            </s-section>
        </div>
    );
}
