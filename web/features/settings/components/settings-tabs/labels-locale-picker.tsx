"use client";

import { useCallback, useEffect } from "react";
import {
    useLocales,
    useSettingsStore,
    useSettingsForm,
} from "@/features/settings";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSettingsAction } from "@/features/settings/actions/settings.action";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { useTranslations } from "@/lib/i18n/provider";

export function LabelsLocalePicker() {
    const { data: locales, isLoading } = useLocales();
    const { labelsLocale, setLabelsLocale, setLocaleLoading, isLocaleLoading } =
        useSettingsStore();
    const { reset, getValues } = useSettingsForm();
    const app = useAppBridge();
    const t = useTranslations("Settings.Locales");

    const primaryLocale = locales?.find((l) => l.primary)?.locale ?? "en";

    const fetchLocaleLabels = useCallback(
        async (locale: string) => {
            try {
                setLocaleLoading(true);
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
                console.warn(
                    "[LabelsLocalePicker] Failed to fetch locale labels:",
                    err,
                );
            } finally {
                setLocaleLoading(false);
            }
        },
        [app, getValues, reset, setLocaleLoading],
    );

    useEffect(() => {
        if (!labelsLocale && locales && locales.length > 1) {
            setLabelsLocale(primaryLocale);
            void fetchLocaleLabels(primaryLocale);
        }
    }, [
        locales,
        labelsLocale,
        primaryLocale,
        setLabelsLocale,
        fetchLocaleLabels,
    ]);

    const handleLocaleChange = useCallback(
        (locale: string) => {
            if (isLocaleLoading || labelsLocale === locale) {
                return;
            }
            setLabelsLocale(locale);
            void fetchLocaleLabels(locale);
        },
        [setLabelsLocale, fetchLocaleLabels, isLocaleLoading, labelsLocale],
    );

    if (isLoading || !locales || locales.length <= 1) {
        return null; // Don't show tabs for single-language stores
    }

    const sortedLocales = [...locales].sort((a, b) => {
        if (a.primary) {
            return -1;
        }

        if (b.primary) {
            return 1;
        }

        return a.name.localeCompare(b.name);
    });

    return (
        <s-section>
            <s-stack gap="base">
                {/* Section Header */}
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{t("title")}</s-heading>

                    <s-stack
                        direction="inline"
                        gap="small-400"
                        alignItems="center"
                    >
                        {isLocaleLoading && <s-spinner size="base" />}
                        {labelsLocale && labelsLocale !== primaryLocale && (
                            <>
                                <s-tooltip id="language-tooltip">
                                    <s-text>
                                        {t("fallbackTooltip", {
                                            primary:
                                                locales.find((l) => l.primary)
                                                    ?.name ?? "",
                                        })}
                                    </s-text>
                                </s-tooltip>
                                <s-icon
                                    tone="neutral"
                                    type="info"
                                    interestFor="language-tooltip"
                                />
                            </>
                        )}
                    </s-stack>
                </s-stack>
                <div>
                    <s-stack
                        direction="inline"
                        gap="small-300"
                        borderRadius="base"
                        padding="none"
                        background="base"
                    >
                        {sortedLocales.map((locale) => (
                            <s-button
                                key={locale.locale}
                                variant={
                                    labelsLocale === locale.locale
                                        ? "secondary"
                                        : "tertiary"
                                }
                                onClick={() =>
                                    handleLocaleChange(locale.locale)
                                }
                                disabled={isLocaleLoading}
                            >
                                {locale.name}
                                {locale.primary && (
                                    <span className="ml-1 opacity-60">
                                        {t("primaryBadge")}
                                    </span>
                                )}
                            </s-button>
                        ))}
                    </s-stack>
                </div>
            </s-stack>
        </s-section>
    );
}
