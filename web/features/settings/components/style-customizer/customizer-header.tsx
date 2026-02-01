"use client";

import { BundleTypeTab, useCustomizerStore } from "@/features/settings";

export function CustomizerHeader({
    activeBundleType,
    onBundleTypeChangeAction,
}: {
    activeBundleType: string;
    onBundleTypeChangeAction: (id: string) => void;
}) {
    const { activeDevice, setActiveDevice } = useCustomizerStore();

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
                        <s-button
                            tone={
                                activeDevice === "desktop"
                                    ? "critical"
                                    : "neutral"
                            }
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("desktop")}
                            icon="desktop"
                        >
                        </s-button>
                        <s-button
                            tone={
                                activeDevice === "tablet"
                                    ? "critical"
                                    : "neutral"
                            }
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("tablet")}
                            icon="tablet"
                        >
                        </s-button>
                        <s-button
                            tone={
                                activeDevice === "mobile"
                                    ? "critical"
                                    : "neutral"
                            }
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("mobile")}
                            icon="mobile"
                        >
                        </s-button>
                    </s-button-group>
                </s-stack>
            </s-section>
        </div>
    );
}
