"use client";

import {
    setupGuideKeys,
    setupGuideQueries,
    SetupStepKey,
    useWidgetStatusStore,
} from "@/features/dashboard";
import { useAppNavigation, useCreateBundleNav, ROUTES } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";
import {
    dismissSetupGuideAction,
    showSetupGuideAction,
    updateSetupStepAction,
} from "@/features/dashboard/actions/setup-guide.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    AUTO_DETECTED_STEPS,
    SETUP_STEP_KEYS,
} from "@/features/dashboard/constants/setup-guide.constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateBundleCache } from "@/features/bundles/utils/bundle-cache";
import { getSetupGuideSteps } from "@/features/dashboard/constants/dashboard.constants";
import {
    checkWidgetBlockStatusAction,
    recheckWidgetBlockStatusAction,
} from "@/features/dashboard/actions/widget-block-status.action";

/**
 * Custom hook for managing the setup guide.
 */
export function useSetupGuide() {
    const t = useTranslations("Dashboard.SetupGuide");
    const tEmbed = useTranslations("Dashboard.AppEmbed");
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = setupGuideQueries(app);
    const { goTo } = useAppNavigation();
    const { create: createBundle } = useCreateBundleNav();
    const widgetStatusStore = useWidgetStatusStore();

    const { data, isLoading } = useQuery(queries.progress());

    const [expanded, setExpanded] = useState<number>(-1);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [checkboxLoadingId, setCheckboxLoadingId] = useState<number | null>(
        null,
    );
    const [buttonLoading, setButtonLoading] = useState<{
        itemId: number;
        type: "primary" | "secondary";
    } | null>(null);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: setupGuideKeys.all });

    const completeStepMutation = useMutation({
        mutationFn: async ({
            key,
            value,
        }: {
            key: SetupStepKey;
            value: boolean;
        }) => {
            const token = await app.idToken();
            const result = await updateSetupStepAction(token, key, value);
            if (result.status === "error") throw new Error(result.message);
        },
        onSuccess: invalidate,
    });

    const dismissMutation = useMutation({
        mutationFn: async () => {
            const token = await app.idToken();
            const result = await dismissSetupGuideAction(token);
            if (result.status === "error") throw new Error(result.message);
        },
        onSuccess: invalidate,
    });

    const showMutation = useMutation({
        mutationFn: async () => {
            const token = await app.idToken();
            const result = await showSetupGuideAction(token);
            if (result.status === "error") throw new Error(result.message);
        },
        onSuccess: invalidate,
    });

    useEffect(() => {
        if (data?.bundlesTransitioned) {
            void invalidateBundleCache(queryClient);
        }
    }, [data?.bundlesTransitioned]);

    useEffect(() => {
        if (!data || data.dismissed) return;
        const needsEmbedCheck = !data.progress.appEmbedEnabled;
        const needsBlockCheck = !data.progress.widgetBlockAdded;
        if (!needsEmbedCheck && !needsBlockCheck) return;

        let cancelled = false;

        // Check app-embed via App Bridge (theme-level toggle — reliable)
        if (needsEmbedCheck) {
            shopify.app
                .extensions()
                .then((extensions) => {
                    if (cancelled) return;
                    const themeExt = extensions.find(
                        (e) => e.type === "theme_app_extension",
                    );
                    if (!themeExt) return;

                    const activations = themeExt.activations as Array<{
                        handle: string;
                        target: string;
                        status: string;
                    }>;
                    const embedActive = activations.some(
                        (a) =>
                            a.handle === "app-embed" &&
                            a.target !== "section" &&
                            a.status === "active",
                    );
                    if (embedActive) {
                        completeStepMutation.mutate({
                            key: "appEmbedEnabled",
                            value: true,
                        });
                    }
                })
                .catch(() => {});
        }

        // Check app-block via cached action (2-3 Shopify API calls, 5 min cache)
        if (needsBlockCheck) {
            app.idToken()
                .then((token) => {
                    if (cancelled) return;
                    return checkWidgetBlockStatusAction(token);
                })
                .then((result) => {
                    if (cancelled || !result) return;
                    if (result.status === "success" && result.data) {
                        widgetStatusStore.setWidgetStatus(result.data);
                        if (result.data.isFullyIntegrated) {
                            completeStepMutation.mutate({
                                key: "widgetBlockAdded",
                                value: true,
                            });
                        }
                    } else {
                        widgetStatusStore.markChecked();
                    }
                })
                .catch(() => {
                    if (!cancelled) widgetStatusStore.markChecked();
                });
        }

        return () => {
            cancelled = true;
        };
    }, [data?.dismissed, data?.progress.appEmbedEnabled, data?.progress.widgetBlockAdded]);

    // Auto-complete widget step when store updates (e.g. from visibilitychange recheck)
    useEffect(() => {
        if (
            widgetStatusStore.widgetStatus?.isFullyIntegrated &&
            data?.progress &&
            !data.progress.widgetBlockAdded
        ) {
            completeStepMutation.mutate({
                key: "widgetBlockAdded",
                value: true,
            });
        }
    }, [widgetStatusStore.widgetStatus?.isFullyIntegrated, data?.progress?.widgetBlockAdded]);

    const progress = data?.progress;
    const shopDomain = data?.shopDomain ?? "";
    const apiKey = data?.apiKey ?? "";

    const items = getSetupGuideSteps(t).map((step) => ({
        ...step,
        complete: progress ? progress[step.stepKey] : false,
        autoDetected: AUTO_DETECTED_STEPS.has(step.stepKey),
    }));

    const completedItemsLength = items.filter((item) => item.complete).length;
    const allComplete = progress
        ? Object.values(progress).every(Boolean)
        : false;

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!progress || hasInitialized.current) return;
        hasInitialized.current = true;
        setExpanded(items.findIndex((item) => !item.complete));
    }, [progress]);

    const toggleGuide = useCallback(() => {
        setIsGuideOpen((prev) => {
            if (!prev) {
                setExpanded(items.findIndex((item) => !item.complete));
            }
            return !prev;
        });
    }, [items]);

    const handleSetExpanded = useCallback(
        (id: number) => setExpanded((prev) => (prev === id ? -1 : id)),
        [],
    );

    const handleItemComplete = useCallback(
        async (itemId: number) => {
            const item = items.find((i) => i.id === itemId);
            if (!item || item.autoDetected) return;

            setCheckboxLoadingId(itemId);
            await completeStepMutation.mutateAsync({
                key: item.stepKey as SetupStepKey,
                value: !item.complete,
            });
            setCheckboxLoadingId(null);
        },
        [items, completeStepMutation],
    );

    const handlePrimaryClick = useCallback(
        async (itemId: number) => {
            const item = items.find((i) => i.id === itemId);
            if (!item) return;

            setButtonLoading({ itemId, type: "primary" });

            if (item.stepKey === SETUP_STEP_KEYS.APP_EMBED) {
                const url = `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`;
                window.open(url, "_blank");
                setButtonLoading(null);
            } else if (item.stepKey === SETUP_STEP_KEYS.WIDGET_BLOCK_ADDED) {
                const url = `https://${shopDomain}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/app-block&target=newAppsSection`;
                window.open(url, "_blank");
                setButtonLoading(null);
            } else if (item.stepKey === SETUP_STEP_KEYS.STOREFRONT_PREVIEW) {
                window.open(`https://${shopDomain}`, "_blank");
                await completeStepMutation.mutateAsync({
                    key: item.stepKey as SetupStepKey,
                    value: true,
                });
                setButtonLoading(null);
            } else if (item.primaryButton?.internalUrl) {
                // Mark step complete on click for navigation-only steps (e.g. analytics)
                if (!item.complete && !AUTO_DETECTED_STEPS.has(item.stepKey)) {
                    await completeStepMutation.mutateAsync({
                        key: item.stepKey as SetupStepKey,
                        value: true,
                    });
                }
                setButtonLoading(null);
                if (item.primaryButton.internalUrl === ROUTES.BUNDLE_CREATE) {
                    createBundle()();
                } else {
                    goTo(item.primaryButton.internalUrl)();
                }
            }
        },
        [items, shopDomain, apiKey, completeStepMutation, goTo, createBundle],
    );

    const handleSecondaryClick = useCallback(
        async (itemId: number) => {
            const item = items.find((i) => i.id === itemId);
            if (!item) return;

            setButtonLoading({ itemId, type: "secondary" });

            if (item.stepKey === SETUP_STEP_KEYS.APP_EMBED) {
                const extensions = await shopify.app.extensions();
                const themeExt = extensions.find(
                    (e) => e.type === "theme_app_extension",
                );
                const activations = (themeExt?.activations ?? []) as Array<{
                    handle: string;
                    target: string;
                    status: string;
                }>;
                const embedActive = activations.some(
                    (a) =>
                        a.handle === "app-embed" &&
                        a.target !== "section" &&
                        a.status === "active",
                );
                if (embedActive) {
                    await completeStepMutation.mutateAsync({
                        key: item.stepKey as SetupStepKey,
                        value: true,
                    });
                    shopify.toast.show(tEmbed("isActive"));
                } else {
                    if (item.complete) {
                        await completeStepMutation.mutateAsync({
                            key: item.stepKey as SetupStepKey,
                            value: false,
                        });
                    }
                    shopify.toast.show(tEmbed("notEnabledYet"), {
                        isError: true,
                    });
                }
            } else if (item.stepKey === SETUP_STEP_KEYS.WIDGET_BLOCK_ADDED) {
                // "Verify" button — bust the cache and force a live recheck
                const token = await app.idToken();
                const result = await recheckWidgetBlockStatusAction(token);
                if (result.status === "success" && result.data) {
                    widgetStatusStore.setWidgetStatus(result.data);
                }
                const blockActive =
                    result.status === "success" &&
                    Boolean(result.data?.isFullyIntegrated);
                if (blockActive) {
                    await completeStepMutation.mutateAsync({
                        key: item.stepKey as SetupStepKey,
                        value: true,
                    });
                    shopify.toast.show(tEmbed("blockIsActive"));
                } else {
                    if (item.complete) {
                        await completeStepMutation.mutateAsync({
                            key: item.stepKey as SetupStepKey,
                            value: false,
                        });
                    }
                    shopify.toast.show(tEmbed("blockNotAddedYet"), {
                        isError: true,
                    });
                }
            } else if (item.secondaryButton?.internalUrl) {
                setButtonLoading(null);
                goTo(item.secondaryButton.internalUrl)();
                return;
            }
            setButtonLoading(null);
        },
        [items, completeStepMutation, goTo],
    );

    return {
        items,
        isLoading,
        dismissed: data?.dismissed ?? false,
        allComplete,
        isDismissing: dismissMutation.isPending,
        isShowing: showMutation.isPending,
        appEmbedEnabled: progress?.appEmbedEnabled ?? false,
        shopDomain,
        apiKey,

        isGuideOpen,
        expanded,
        completedItemsLength,
        checkboxLoadingId,
        buttonLoading,

        onDismiss: () => dismissMutation.mutateAsync(),
        showGuide: () => showMutation.mutateAsync(),
        toggleGuide,
        setExpanded: handleSetExpanded,
        onItemComplete: handleItemComplete,
        onPrimaryClick: handlePrimaryClick,
        onSecondaryClick: handleSecondaryClick,
    };
}
