"use client";

import { useCallback, useEffect } from "react";
import { useLocales } from "@/features/settings/hooks/settings/use-locales";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { useSettingsForm } from "@/features/settings/hooks/settings/use-settings-form";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSettingsAction } from "@/features/settings/actions/settings.action";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

export function LabelsLocalePicker() {
    const { data: locales, isLoading } = useLocales();
    const { labelsLocale, setLabelsLocale } = useSettingsStore();
    const { reset, getValues } = useSettingsForm();
    const app = useAppBridge();

    const primaryLocale = locales?.find((l) => l.primary)?.locale ?? "en";

    const fetchLocaleLabels = useCallback(
        async (locale: string) => {
            try {
                const token = await app.idToken();
                const result = await getSettingsAction(token, locale);

                if (result.status === "success" && result.data) {
                    const currentValues = getValues();
                    const emptyLabels = Object.fromEntries(
                        Object.keys(DEFAULT_LABELS).map((k) => [k, ""]),
                    );
                    reset({
                        ...currentValues,
                        labels: result.data.labels ?? emptyLabels,
                    });
                }
            } catch (err) {
                console.warn("[LabelsLocalePicker] Failed to fetch locale labels:", err);
            }
        },
        [app, getValues, reset],
    );

    useEffect(() => {
        if (!labelsLocale && locales && locales.length > 1) {
            setLabelsLocale(primaryLocale);
            fetchLocaleLabels(primaryLocale);
        }
    }, [locales, labelsLocale, primaryLocale, setLabelsLocale, fetchLocaleLabels]);

    const handleLocaleChange = useCallback(
        (locale: string) => {
            setLabelsLocale(locale);
            fetchLocaleLabels(locale);
        },
        [setLabelsLocale, fetchLocaleLabels],
    );

    if (isLoading || !locales || locales.length <= 1) {
        return null;
    }

    return (
        <s-section>
            <s-stack gap="small-200">
                <s-text type="strong">Language</s-text>
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    {locales.map((locale) => (
                        <button
                            key={locale.locale}
                            type="button"
                            onClick={() => handleLocaleChange(locale.locale)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                labelsLocale === locale.locale
                                    ? "bg-[#303030] text-white border-[#303030]"
                                    : "bg-white text-[#303030] border-[#d1d1d1] hover:bg-[#f7f7f7]"
                            }`}
                        >
                            {locale.name}
                            {locale.primary && (
                                <span className="ml-1 text-xs opacity-60">
                                    (Primary)
                                </span>
                            )}
                        </button>
                    ))}
                </s-stack>
                {labelsLocale && labelsLocale !== primaryLocale && (
                    <s-text tone="neutral">
                        Empty fields will fall back to the primary language ({locales.find((l) => l.primary)?.name}).
                    </s-text>
                )}
            </s-stack>
        </s-section>
    );
}
