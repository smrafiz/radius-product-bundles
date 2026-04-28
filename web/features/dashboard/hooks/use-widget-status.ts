"use client";

import { useCallback, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useWidgetStatusStore } from "@/features/dashboard";
import { checkWidgetBlockStatusAction } from "@/features/dashboard/actions/widget-block-status.action";

/**
 * Custom hook for managing the widget status.
 *
 * App embed detection uses shopify.app.extensions() (App Bridge) — reliable.
 * Widget block detection uses GraphQL theme files query — reads template JSON.
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

    // Function to manually trigger a recheck
    const recheck = useCallback(async () => {
        if (!app || !shopDomain) return;

        try {
            const token = await app.idToken();
            const [blockResult, embedActive] = await Promise.all([
                checkWidgetBlockStatusAction(token),
                detectAppEmbed(),
            ]);

            if (blockResult.status === "success" && blockResult.data) {
                setWidgetStatus({
                    ...blockResult.data,
                    hasAppEmbed: embedActive || blockResult.data.hasAppEmbed,
                });
            }
        } catch {
            // Silent fail
        }
    }, [app, shopDomain, setWidgetStatus]);

    // Initial check — runs on mount; silently rechecks if cached status
    // is unhealthy (e.g. user just toggled the embed in another tab and
    // came back via in-app navigation, which doesn't fire visibilitychange).
    useEffect(() => {
        if (!app || !shopDomain) {
            return;
        }
        const cachedHealthy =
            widgetStatus?.hasAppEmbed && widgetStatus?.isFullyIntegrated;
        if (isChecked && cachedHealthy) {
            return;
        }

        let cancelled = false;

        async function check() {
            try {
                const token = await app.idToken();
                if (cancelled) return;

                // Run both checks in parallel
                const [blockResult, embedActive] = await Promise.all([
                    checkWidgetBlockStatusAction(token),
                    detectAppEmbed(),
                ]);

                if (cancelled) return;

                if (blockResult.status === "success" && blockResult.data) {
                    setWidgetStatus({
                        ...blockResult.data,
                        hasAppEmbed: embedActive || blockResult.data.hasAppEmbed,
                    });
                } else {
                    setWidgetStatus({
                        hasWidgetBlock: false,
                        hasAppEmbed: embedActive,
                        isFullyIntegrated: false,
                        checkedTemplates: [],
                        checkedSections: [],
                        detectedInTheme: null,
                    });
                }
            } catch {
                if (!cancelled) markChecked();
            }
        }

        check();

        return () => {
            cancelled = true;
        };
    }, [app, shopDomain, isChecked, widgetStatus, setWidgetStatus, markChecked]);

    // Background recheck when the tab regains focus (e.g. returning from theme editor)
    useEffect(() => {
        if (!app || !shopDomain) {
            return;
        }

        const handleVisibility = async () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            const { widgetStatus: current } = useWidgetStatusStore.getState();
            if (current?.hasAppEmbed && current?.isFullyIntegrated) {
                return;
            }

            try {
                const token = await app.idToken();
                const [blockResult, embedActive] = await Promise.all([
                    checkWidgetBlockStatusAction(token),
                    detectAppEmbed(),
                ]);

                if (blockResult.status === "success" && blockResult.data) {
                    useWidgetStatusStore.getState().setWidgetStatus({
                        ...blockResult.data,
                        hasAppEmbed:
                            embedActive || blockResult.data.hasAppEmbed,
                    });
                }
            } catch {}
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
        recheck,
    };
}

/**
 * Detects app embed status via App Bridge shopify.app.extensions().
 * This is the same reliable method used by the setup guide.
 */
async function detectAppEmbed(): Promise<boolean> {
    try {
        const extensions = await shopify.app.extensions();
        const themeExt = extensions.find(
            (e) => e.type === "theme_app_extension",
        );
        if (!themeExt) return false;

        const activations = themeExt.activations as Array<{
            handle: string;
            target: string;
            status: string;
        }>;

        return activations.some(
            (a) =>
                a.handle === "app-embed" &&
                a.target !== "section" &&
                a.status === "active",
        );
    } catch {
        return false;
    }
}
