"use client";

import { useState } from "react";
import type { BundleConfig } from "@/features/bundles";
import { useAppNavigation, withLoader } from "@/shared";

export function BundleTypeCard({ bundleType }: { bundleType: BundleConfig }) {
    const { bundleData } = useAppNavigation();

    const [isSelecting, setIsSelecting] = useState(false);

    const handleSelect = async () => {
        setIsSelecting(true);

        try {
            const navigate = bundleData.create(bundleType.slug);
            navigate();
        } catch (error) {
            console.error("Navigation error:", error);
            setIsSelecting(false);
        }
    };
    return (
        <div style={{position:"relative"}}>
            <s-box background="base" border="base" borderRadius="base">
                <s-stack gap="base">
                    {/* Badge Section */}
                    <div style={{position:"absolute", right:"16px", top:"16px"}}>
                        {bundleType.badge && (
                            <s-badge tone={bundleType.badge.tone}>
                                {bundleType.badge.text}
                            </s-badge>
                        )}
                    </div>

                    {/* Image Section */}
                    {bundleType.bundleImage && (
                        <s-box>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background:
                                        "var(--p-color-bg-surface-secondary)",
                                    borderRadius: " 7px 7px 0 0",
                                    minHeight: "145px",
                                    width: "100%",
                                }}
                            >
                                <img
                                    src={bundleType.bundleImage}
                                    alt={bundleType.label}
                                />
                            </div>
                        </s-box>
                    )}
                </s-stack>
                <s-stack padding="base" gap="small-300">
                    <s-stack>
                        <s-heading>{bundleType.label}</s-heading>
                    </s-stack>

                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <s-stack gap="small">
                            <s-button
                                variant="secondary"
                                onClick={withLoader(handleSelect)}
                                loading={isSelecting}
                                disabled={bundleType.comingSoon}
                                accessibilityLabel="Select App"
                            >
                                {bundleType.comingSoon ? "Coming Soon" : "Select"}
                            </s-button>
                        </s-stack>
                        <s-button commandFor={`modal-${bundleType.id}`}>
                            <s-icon type="question-circle" />
                        </s-button>

                        <s-modal
                            id={`modal-${bundleType.id}`}
                            heading={bundleType.label}
                        >
                            <s-stack gap="base">
                                {bundleType.modalImage && (
                                    <s-stack>
                                        <img
                                            src={bundleType.modalImage}
                                            alt={bundleType.label}
                                        />
                                    </s-stack>
                                )}
                                <s-paragraph>{bundleType.description}</s-paragraph>
                                {bundleType.features &&
                                    bundleType.features.length > 0 && (
                                        <s-unordered-list>
                                            {bundleType.features.map(
                                                (feature, index) => (
                                                    <s-list-item key={index}>
                                                        {feature}
                                                    </s-list-item>
                                                ),
                                            )}
                                        </s-unordered-list>
                                    )}
                                <s-stack>
                                    <s-button variant="primary">
                                        Create the bundle
                                    </s-button>
                                </s-stack>
                            </s-stack>
                        </s-modal>
                    </s-stack>
                </s-stack>
            </s-box>
        </div>
    );
}
