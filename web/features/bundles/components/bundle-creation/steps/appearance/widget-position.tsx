"use client";

import { useBundleStore, WIDGET_POSITIONS } from "@/features/bundles";

export function WidgetPosition() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    function handlePositionChange(value: string) {
        updateDisplaySettings("position", value as any);
    }

    function handleTitleChange(event: Event) {
        const target = event.currentTarget as HTMLInputElement;
        updateDisplaySettings("title", target.value);
    }

    function handleAddToCartTitleChange(event: Event) {
        const target = event.currentTarget as HTMLInputElement;
        updateDisplaySettings("cartTitle", target.value);
    }

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Product page</s-heading>

                <s-select
                    label="Display position"
                    details="Choose where the bundle widget appears on product pages"
                    required
                    value={displaySettings.position}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLSelectElement;
                        handlePositionChange(target.value);
                    }}
                >
                    {WIDGET_POSITIONS.map((option) => (
                        <s-option key={option.value} value={option.value}>
                            {option.label}
                        </s-option>
                    ))}
                </s-select>

                <s-text-field
                    label="Offer title"
                    value={displaySettings.title || ""}
                    onChange={handleTitleChange}
                />

                <s-text-field
                    required
                    label="'Add to cart' button text"
                    value={displaySettings.cartTitle || ""}
                    onChange={handleAddToCartTitleChange}
                />
            </s-stack>
        </s-section>
    );
}
