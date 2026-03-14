"use client";

import {
    AppSettingsFormData,
    useSettingsSubmit,
    useSettingsQuery,
    useLocales,
} from "@/features/settings";
import { GlobalForm } from "@/shared";
import {
    SettingsFormProvider,
    SettingsTab,
} from "@/features/settings/components";
import { TitleBar } from "@shopify/app-bridge-react";
import SettingsPageSkeleton from "@/app/(dashboard)/settings/loading";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Settings page content component.
 */
function SettingsPageContent() {
    const { handleSubmit, resetDirty } = useSettingsSubmit();

    const t = useTranslations("Settings");

    return (
        <GlobalForm<AppSettingsFormData>
            formId="settings"
            onSubmit={handleSubmit}
            resetDirty={resetDirty}
        >
            <s-page heading={t("pageTitle")}>
                <TitleBar title={t("pageTitle")}></TitleBar>
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
    const {
        data: settingsData,
        isLoading: isSettingsLoading,
        error,
    } = useSettingsQuery();
    const { isLoading: isLocalesLoading } = useLocales();
    const t = useTranslations("Settings");

    // Show loading state
    if (isSettingsLoading || isLocalesLoading) {
        return <SettingsPageSkeleton />;
    }

    // Show error state
    if (error) {
        return (
            <s-page heading={t("title")}>
                <s-banner tone="critical" heading={t("errorLoading")}>
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
