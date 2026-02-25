"use client";

import React, { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useBundleStore, useBundleValidation } from "@/features/bundles";

export function WidgetPosition() {
    const { displaySettings, updateDisplaySettings, markFieldTouched } =
        useBundleStore();
    const { getFieldError } = useBundleValidation();
    const { setValue, trigger } = useFormContext();

    const handleTitleChange = useCallback(
        (value: string) => {
            updateDisplaySettings("title", value);
            setValue("settings.title", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleSubtitleChange = useCallback(
        (value: string) => {
            updateDisplaySettings("subtitle", value);
            setValue("settings.subtitle", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleSubtitleBlur = useCallback(() => {
        markFieldTouched("settings.subtitle");
        void trigger("settings.subtitle");
    }, [markFieldTouched, trigger]);

    const handleCartButtonTextChange = useCallback(
        (value: string) => {
            updateDisplaySettings("cartButtonText", value);
            setValue("settings.cartButtonText", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
        },
        [updateDisplaySettings, setValue],
    );

    const handleTitleBlur = useCallback(() => {
        markFieldTouched("settings.title");
        void trigger("settings.title");
    }, [markFieldTouched, trigger]);

    const handleCartButtonTextBlur = useCallback(() => {
        markFieldTouched("settings.cartButtonText");
        void trigger("settings.cartButtonText");
    }, [markFieldTouched, trigger]);

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
                            Customize the widget title and button text shown on
                            product pages where this bundle appears.
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
                        handleTitleChange(target.value);
                    }}
                    onBlur={handleTitleBlur}
                    error={getFieldError("settings.title")}
                    maxLength={100}
                    required
                />

                <s-text-area
                    label="Offer subtitle"
                    value={displaySettings.subtitle || ""}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        handleSubtitleChange(target.value);
                    }}
                    rows={3}
                    onBlur={handleSubtitleBlur}
                    error={getFieldError("settings.subtitle")}
                    maxLength={300}
                    placeholder="Optional subtitle text"
                />

                <s-text-field
                    label="'Add to cart' button text"
                    value={displaySettings.cartButtonText || ""}
                    onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        handleCartButtonTextChange(target.value);
                    }}
                    onBlur={handleCartButtonTextBlur}
                    error={getFieldError("settings.cartButtonText")}
                    maxLength={50}
                    required
                />
            </s-stack>
        </s-section>
    );
}
