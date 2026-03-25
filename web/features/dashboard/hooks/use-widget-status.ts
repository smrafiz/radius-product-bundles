"use client";

import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useWidgetStatusStore } from "@/features/dashboard";
import { checkWidgetBlockStatusAction } from "@/features/dashboard/actions/widget-block-status.action";

/**
 * Custom hook for managing the widget status.
 */
export function useWidgetStatus({
    shopDomain,
    apiKey,
}: {
    shopDomain: string;
    apiKey: string;
}) {
    const app = useAppBridge();
    const { widgetStatus, isChecked, setWidgetStatus, markChecked } =
        useWidgetStatusStore();

    // Initial check — runs once per session
    useEffect(() => {
        if (!app || !shopDomain || isChecked) {
            return;
        }

        let cancelled = false;

        app.idToken()
            .then((token) => {
                if (cancelled) return;
                return checkWidgetBlockStatusAction(token);
            })
            .then((result) => {
                if (cancelled || !result) return;
                if (result.status === "success" && result.data) {
                    setWidgetStatus(result.data);
                } else {
                    markChecked();
                }
            })
            .catch(() => {
                if (!cancelled) markChecked();
            });

        return () => {
            cancelled = true;
        };
    }, [app, shopDomain, isChecked, setWidgetStatus, markChecked]);

    // Background recheck when the tab regains focus (e.g. returning from theme editor)
    useEffect(() => {
        if (!app || !shopDomain) {
            return;
        }

        const handleVisibility = () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            // Skip recheck only if both embed and block are active
            const { widgetStatus: current } = useWidgetStatusStore.getState();
            if (current?.hasAppEmbed && current?.isFullyIntegrated) {
                return;
            }

            app.idToken()
                .then((token) => checkWidgetBlockStatusAction(token))
                .then((result) => {
                    if (result.status === "success" && result.data) {
                        useWidgetStatusStore.getState().setWidgetStatus(result.data);
                    }
                })
                .catch(() => {});
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () =>
            document.removeEventListener("visibilitychange", handleVisibility);
    }, [app, shopDomain]);

    const themeEditorUrl =
        shopDomain && apiKey
            ? `https://${shopDomain}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/app-block&target=newAppsSection`
            : null;

    return {
        isBlockActive: widgetStatus?.isFullyIntegrated ?? false,
        hasWidgetBlock: widgetStatus?.hasWidgetBlock ?? false,
        hasAppEmbed: widgetStatus?.hasAppEmbed ?? false,
        isChecking: !isChecked,
        themeEditorUrl,
    };
}
