"use client";

import {
    createContext,
    useContext,
    useCallback,
    type ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────
type MessageValue = string | Record<string, unknown>;
type Messages = Record<string, Record<string, MessageValue>>;

interface I18nContextValue {
    locale: string;
    messages: Messages;
}

// ─── Context ─────────────────────────────────────────────────────────
const I18nContext = createContext<I18nContextValue>({
    locale: "en",
    messages: {},
});

// ─── Provider (drop-in replacement for NextIntlClientProvider) ───────
export function I18nProvider({
    locale,
    messages,
    children,
}: {
    locale: string;
    messages: Messages;
    children: ReactNode;
}) {
    return (
        <I18nContext.Provider value={{ locale, messages }}>
            {children}
        </I18nContext.Provider>
    );
}

// ─── Hook (drop-in replacement for useTranslations) ──────────────────
export function useTranslations(namespace: string) {
    const { messages } = useContext(I18nContext);

    // Support dot-notation namespaces like "Dashboard.Metrics"
    const namespaceParts = namespace.split(".");
    let section: unknown = messages;
    for (const part of namespaceParts) {
        if (section && typeof section === "object" && part in section) {
            section = (section as Record<string, unknown>)[part];
        } else {
            section = {};
            break;
        }
    }

    const resolvedSection = (section || {}) as Record<string, unknown>;

    return useCallback(
        (key: string, params?: Record<string, string | number>) => {
            // Support dot-notation keys like "steps.enableAppEmbed.title"
            const parts = key.split(".");
            let value: unknown = resolvedSection;
            for (const part of parts) {
                if (value && typeof value === "object" && part in value) {
                    value = (value as Record<string, unknown>)[part];
                } else {
                    return key; // fallback to key if not found
                }
            }

            if (typeof value !== "string") return key;

            // Simple parameter interpolation: {paramName}
            if (params) {
                return value.replace(
                    /\{(\w+)\}/g,
                    (_, k) => String(params[k] ?? `{${k}}`),
                );
            }
            return value;
        },
        [resolvedSection],
    );
}

// ─── Utility: get the current locale from context ────────────────────
export function useLocale() {
    const { locale } = useContext(I18nContext);
    return locale;
}
