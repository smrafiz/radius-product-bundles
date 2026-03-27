"use client";

import { useCustomizerStore } from "@/features/settings";
import { BundleTypeTab } from "./bundle-type-tab";

import type { PreviewTemplateId } from "@/features/settings";

export function CustomizerHeader({
    activeBundleType,
    onBundleTypeChangeAction,
    availableTypes,
}: {
    activeBundleType: string;
    onBundleTypeChangeAction: (id: string) => void;
    availableTypes?: PreviewTemplateId[];
}) {
    const { activeDevice, setActiveDevice } = useCustomizerStore();
    const tone = activeDevice === "desktop" ? "info" : "auto";

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
                        availableTypes={availableTypes}
                    />

                    <s-button-group gap="none">
                        <s-button
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("desktop")}
                        >
                            <span
                                className={
                                    activeDevice === "desktop"
                                        ? "opacity-100"
                                        : "opacity-50"
                                }
                            >
                                <s-icon
                                    type="desktop"
                                    tone={
                                        activeDevice === "desktop"
                                            ? "info"
                                            : "auto"
                                    }
                                />
                            </span>
                        </s-button>
                        <s-button
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("tablet")}
                        >
                            {" "}
                            <span
                                className={
                                    activeDevice === "tablet"
                                        ? "opacity-100"
                                        : "opacity-50"
                                }
                            >
                                <s-icon
                                    type="tablet"
                                    tone={
                                        activeDevice === "tablet"
                                            ? "info"
                                            : "auto"
                                    }
                                />
                            </span>
                        </s-button>
                        <s-button
                            slot="secondary-actions"
                            onClick={() => setActiveDevice("mobile")}
                        >
                            {" "}
                            <span
                                className={
                                    activeDevice === "mobile"
                                        ? "opacity-100"
                                        : "opacity-50"
                                }
                            >
                                <s-icon
                                    type="mobile"
                                    tone={
                                        activeDevice === "mobile"
                                            ? "info"
                                            : "auto"
                                    }
                                />
                            </span>
                        </s-button>
                    </s-button-group>
                </s-stack>
            </s-section>
        </div>
    );
}
