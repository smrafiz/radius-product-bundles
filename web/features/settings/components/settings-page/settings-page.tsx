"use client";

import {
    AppSettingsFormData,
    SettingsFormProvider,
    SettingsTab,
    useSettingsSubmit,
    useSettingsQuery,
} from "@/features/settings";
import { GlobalForm, LoadingSpinner } from "@/shared";
import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import SettingsPageSkeleton from "@/app/(dashboard)/settings/loading";

/**
 * Settings page content component.
 */
function SettingsPageContent() {
    const { handleSubmit, resetDirty } = useSettingsSubmit();

    return (
        <GlobalForm<AppSettingsFormData>
            formId="settings"
            onSubmit={handleSubmit}
            resetDirty={resetDirty}
        >
            <s-page heading="Settings">
                <s-stack paddingBlockStart="large-300" paddingBlockEnd="large">
                    <SettingsTab />
                </s-stack>
            </s-page>
        </GlobalForm>
    );
}

/**
 * Settings page component.
 *
 * Fetches settings from API and wraps content with form provider.
 */
export function SettingsPage() {
    // Fetch settings from API
    const { data: settingsData, isLoading, error } = useSettingsQuery();
    const { setServerData, setLoading } = useSettingsStore();

    // Sync React Query data with Zustand store
    useEffect(() => {
        if (settingsData) {
            setServerData(settingsData);
        }
    }, [settingsData, setServerData]);

    // Sync loading state
    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    // Show loading state
    if (isLoading) {
        return <SettingsPageSkeleton />;
    }

    // Show error state
    if (error) {
        return (
            <s-page heading="Settings">
                <s-banner tone="critical" heading="Failed to load settings">
                    {error.message}
                </s-banner>
            </s-page>
        );
    }

    // Pass fetched data to form provider
    return (
        <SettingsFormProvider initialData={settingsData ?? undefined}>
            <SettingsPageContent />
        </SettingsFormProvider>
    );
}
