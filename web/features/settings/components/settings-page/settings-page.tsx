"use client";

import { SettingsTab } from "@/features/settings";
import { useAppNavigation } from "@/shared";

/**
 * Pricing Page Component
 */
export function SettingsPage() {
    const { goBack } = useAppNavigation();

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={() => goBack()}
                            icon="arrow-left"
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Settings</div>
                        </s-heading>
                        <s-text>Choose the right plan for your business</s-text>
                    </s-stack>
                </s-stack>

                <s-stack gap="large">
                    {/* Pricing Faq */}
                    <SettingsTab />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
