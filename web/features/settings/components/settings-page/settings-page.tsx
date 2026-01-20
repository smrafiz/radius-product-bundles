"use client";

import { useEffect } from "react";
import { useAppNavigation } from "@/shared";
import { SettingsTab, useSettingStore } from "@/features/settings";

/**
 * Settings Page Component
 */
export function SettingsPage() {
    const { goTo } = useAppNavigation();
    const { toast, loading, setLoading, hideToast, showToast } =
        useSettingStore();

    return (
        <form
            data-save-bar
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const formEntries = Object.fromEntries(formData);
                console.log("Form data", formEntries);
            }}
            onReset={(event) => {
                console.log("Handle discarded changes if necessary");
            }}
        >
        <s-page heading="Settings">
            <SettingsTab />
        </s-page>
        </form>
    );
}
