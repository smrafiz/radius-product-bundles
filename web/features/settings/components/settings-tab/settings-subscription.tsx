"use client";
import React, { useState } from "react";

export function SettingsSubscription() {
    const [isSealIntegrationEnabled, setIsSealIntegrationEnabled] = useState<boolean>(true);
    return (
        <s-section heading="Subscriptions">
            <s-stack gap="base">
                {/* First Checkbox */}
                <s-checkbox
                    label="Seal Subscriptions app integration"
                    checked={isSealIntegrationEnabled}
                    onChange={() => setIsSealIntegrationEnabled(prev => !prev)}
                    details="Enable this integration to show subscription widgets on products in bundle widgets. You must also have the Seal Subscriptions app installed."
                />

                {/* Conditionally show second checkbox */}
                {isSealIntegrationEnabled && (
                    <s-checkbox
                        label="Enable subscription widgets in volume discounts"
                        details="Turn this on to also show the subscription widgets in the volume discount widgets."
                    />
                )}
            </s-stack>
        </s-section>
    );
}
