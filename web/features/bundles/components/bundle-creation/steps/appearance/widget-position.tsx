"use client";

import React from "react";
import { DisplaySettings, useBundleStore } from "@/features/bundles";

export function WidgetPosition() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Product page</s-heading>
                    <s-tooltip id="product-page-display-tooltip">
                        <s-text>
                            Choose where the bundle widget appears on product
                            pages
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="product-page-display-tooltip"
                    />
                </s-stack>

                <s-text-field
                    label="Offer title"
                    value={displaySettings.title || ""}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        updateDisplaySettings("title", target.value);
                    }}
                />

                <s-text-field
                    label="'Add to cart' button text"
                    value={displaySettings.cartButtonText || ""}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        updateDisplaySettings("cartButtonText", target.value);
                    }}
                />
            </s-stack>
        </s-section>
    );
}
