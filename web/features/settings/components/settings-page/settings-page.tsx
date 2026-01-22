"use client";

import {
    SettingsFormProvider,
    SettingsTab,
    useSettingsSubmit,
} from "@/features/settings";

/**
 * Settings page content component
 */
function SettingsPageContent() {
    const { submitSettings, isDirty, isSubmitting } = useSettingsSubmit();

    /**
     * Handles form submission
     */
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await submitSettings();
    }

    /**
     * Handles form reset/discard
     */
    function handleReset() {
        console.log("Handle discarded changes if necessary");
    }

    return (
        <form data-save-bar onSubmit={handleSubmit} onReset={handleReset}>
            <s-page heading="Settings">
                <s-stack paddingBlockStart="large-300" paddingBlockEnd="large">
                    <SettingsTab />
                </s-stack>
            </s-page>
        </form>
    );
}

/**
 * Settings page component
 *
 * Wraps content with form provider for RHF context.
 */
export function SettingsPage() {
    // TODO: Fetch initial settings from API
    const initialData = undefined;

    return (
        <SettingsFormProvider initialData={initialData}>
            <SettingsPageContent />
        </SettingsFormProvider>
    );
}
