"use client";

import { useCallback, useEffect, useState } from "react";
import {
    useLocales,
    useSettingsStore,
    useSettingsForm,
    settingsQueryKeys,
} from "@/features/settings";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useQueryClient } from "@tanstack/react-query";
import {
    getSettingsAction,
    refreshLocalesAction,
    autoTranslateLabelsAction,
} from "@/features/settings/actions/settings.action";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { useTranslations } from "@/lib/i18n/provider";
import { triggerSaveBar } from "@/shared";

export function LabelsLocalePicker() {
    const { data: locales, isLoading } = useLocales();
    const {
        labelsLocale,
        setLabelsLocale,
        setLocaleLoading,
        isLocaleLoading,
        markDirty,
    } = useSettingsStore();
    const { reset, getValues, setValue } = useSettingsForm();
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const t = useTranslations("Settings.Locales");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);

    const primaryLocale = locales?.find((l) => l.primary)?.locale ?? "en";

    const fetchLocaleLabels = useCallback(
        async (locale: string) => {
            const emptyLabels = Object.fromEntries(
                Object.keys(DEFAULT_LABELS).map((k) => [k, ""]),
            );
            try {
                setLocaleLoading(true);
                // Clear inputs immediately so old locale data doesn't linger during fetch
                reset({ ...getValues(), labels: emptyLabels });
                const token = await app.idToken();
                const result = await getSettingsAction(token, locale);

                if (result.status === "success" && result.data) {
                    reset({
                        ...getValues(),
                        labels: {
                            ...emptyLabels,
                            ...(result.data.labels ?? {}),
                        },
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

    const handleAutoTranslate = useCallback(async () => {
        if (!labelsLocale || labelsLocale === primaryLocale || isTranslating)
            return;
        try {
            setTranslateError(null);
            setIsTranslating(true);
            setLocaleLoading(true);
            const token = await app.idToken();
            const result = await autoTranslateLabelsAction(
                token,
                primaryLocale,
                labelsLocale,
            );

            if (result.status === "success" && result.data) {
                const currentLabels = (getValues("labels") ?? {}) as Record<
                    string,
                    string
                >;
                // Only fill blank fields — don't overwrite existing translations
                let filled = false;
                for (const [key, value] of Object.entries(result.data)) {
                    if (!currentLabels[key]?.trim()) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setValue(`labels.${key}` as any, value as string);
                        filled = true;
                    }
                }
                if (filled) {
                    markDirty();
                    triggerSaveBar("settings");
                }
            } else {
                setTranslateError(result.message ?? t("translateError"));
            }
        } catch {
            setTranslateError(t("translateError"));
        } finally {
            setIsTranslating(false);
            setLocaleLoading(false);
        }
    }, [
        app,
        labelsLocale,
        primaryLocale,
        isTranslating,
        setLocaleLoading,
        getValues,
        setValue,
        markDirty,
        t,
    ]);

    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;
        try {
            setIsRefreshing(true);
            const token = await app.idToken();
            await refreshLocalesAction(token);
            await queryClient.invalidateQueries({
                queryKey: settingsQueryKeys.locales(),
            });
        } catch (err) {
            console.warn(
                "[LabelsLocalePicker] Failed to refresh locales:",
                err,
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [app, isRefreshing, queryClient]);

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
                        {(isLocaleLoading || isRefreshing) && (
                            <s-spinner size="base" />
                        )}
                        <s-tooltip id="refresh-languages-tooltip">
                            <s-text>{t("refresh")}</s-text>
                        </s-tooltip>
                        <s-button
                            variant="tertiary"
                            icon="refresh"
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLocaleLoading}
                            interestFor="refresh-languages-tooltip"
                        />
                        {labelsLocale && labelsLocale !== primaryLocale && (
                            <>
                                <s-tooltip id="auto-translate-tooltip">
                                    <s-text>{t("autoTranslateTooltip")}</s-text>
                                </s-tooltip>
                                <s-button
                                    variant="secondary"
                                    icon="language-translate"
                                    onClick={handleAutoTranslate}
                                    disabled={isTranslating || isLocaleLoading}
                                    interestFor="auto-translate-tooltip"
                                >
                                    {isTranslating
                                        ? t("translating")
                                        : t("autoTranslate")}
                                </s-button>
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
                {translateError && (
                    <s-banner
                        tone="critical"
                        onDismiss={() => setTranslateError(null)}
                    >
                        <s-text>{translateError}</s-text>
                    </s-banner>
                )}
            </s-stack>
        </s-section>
    );
}
