"use client";

import { Knob } from "@/shared";
import { Fragment } from "react";
import { ADVANCED_OPTIONS, useBundleStore } from "@/features/bundles";
import { BlockStack, Card, Divider, InlineStack, Text } from "@shopify/polaris";

export function AdvancedOptions() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    Advanced Options
                </s-heading>
                    {ADVANCED_OPTIONS.map(
                        ({ key, title, description }, index) => {
                            const selected = displaySettings[key];
                            return (
                                <s-stack key={key} gap="base">
                                    <s-switch
                                        label={title}
                                        details={description}
                                        checked={selected}
                                        onChange={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateDisplaySettings(key, target.checked);
                                        }}
                                    />
                                    {index < ADVANCED_OPTIONS.length - 1 && (
                                        <s-divider />
                                    )}
                                </s-stack>
                            );
                        },
                    )}
            </s-stack>
        </s-section>
    );
}
