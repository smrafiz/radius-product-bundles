"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { ADVANCED_OPTIONS, useBundleStore } from "@/features/bundles";

export function WidgetDisplaySettings() {
    const { displaySettings, updateDisplaySettings, markFieldTouched } =
        useBundleStore();
    const { setValue } = useFormContext();

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Display Settings</s-heading>
                    <s-tooltip id="product-page-settings-display-tooltip">
                        <s-text>
                            Choose how you want to display the bundle widget on
                            product pages.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="product-page-settings-display-tooltip"
                    />
                </s-stack>
                {ADVANCED_OPTIONS.map(({ key, title, description }, index) => {
                    const selected = displaySettings[key];
                    return (
                        <s-stack key={key} gap="base">
                            <s-switch
                                label={title}
                                details={description}
                                checked={selected}
                                onInput={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                    updateDisplaySettings(key, target.checked);
                                    setValue(
                                        `settings.${key}`,
                                        target.checked,
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        },
                                    );
                                    markFieldTouched(`settings.${key}`);
                                }}
                            />
                            {index < ADVANCED_OPTIONS.length - 1 && (
                                <s-divider />
                            )}
                        </s-stack>
                    );
                })}
            </s-stack>
        </s-section>
    );
}
