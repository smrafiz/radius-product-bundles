"use client";

import { useEffect } from "react";
import { useAppNavigation } from "@/shared";
import { SettingsTab, useSettingStore } from "@/features/settings";

/**
 * Settings Page Component
 */
export function SettingsPage() {
    const { goBack } = useAppNavigation();
    const { toast, loading, setLoading, hideToast, showToast } =
        useSettingStore();

    const handleApply = async () => {
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 800));
            showToast("Settings applied successfully!");
        } catch (err) {
            showToast("Failed to apply settings!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (
            toast.active &&
            typeof shopify !== "undefined" &&
            shopify.toast?.show
        ) {
            shopify.toast.show(toast.message, {
                duration: 5000,
                onDismiss: hideToast,
            });
        }
    }, [toast.active, toast.message, hideToast]);

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack
                    direction="inline"
                    gap="base"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-stack direction="inline" gap="base">
                        <s-stack paddingBlockStart="small-500">
                            <s-button
                                onClick={() => goBack()}
                                icon="arrow-left"
                                accessibilityLabel="Back"
                            ></s-button>
                        </s-stack>
                        <s-stack>
                            <s-heading>
                                <div className="text-lg">Settings</div>
                            </s-heading>
                            <s-text color="subdued">
                                Choose the right plan for your business
                            </s-text>
                        </s-stack>
                    </s-stack>
                    <s-button
                        variant="primary"
                        loading={loading}
                        onClick={handleApply}
                    >
                        Save
                    </s-button>
                </s-stack>

                <s-stack gap="large">
                    <SettingsTab />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
