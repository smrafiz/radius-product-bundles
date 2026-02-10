"use client";

import {
    setupGuideKeys,
    setupGuideQueries,
    SetupStepKey,
} from "@/features/dashboard";
import { useAppNavigation } from "@/shared";
import {
    dismissSetupGuideAction,
    showSetupGuideAction,
    updateSetupStepAction,
} from "@/features/dashboard/actions/setup-guide.action";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SETUP_GUIDE_STEPS } from "@/features/dashboard/constants/dashboard.constants";
import {
    AUTO_DETECTED_STEPS,
    SETUP_STEP_KEYS,
} from "@/features/dashboard/constants/setup-guide.constants";

export function useSetupGuide() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = setupGuideQueries(app);
    const { goTo } = useAppNavigation();

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
        if (!data || data.dismissed || data.progress.appEmbedEnabled) return;

        shopify.app.extensions().then((extensions) => {
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
        });
    }, [data]);

    const progress = data?.progress;
    const shopDomain = data?.shopDomain ?? "";
    const apiKey = data?.apiKey ?? "";

    const items = SETUP_GUIDE_STEPS.map((step) => ({
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
            } else if (item.stepKey === SETUP_STEP_KEYS.STOREFRONT_PREVIEW) {
                window.open(`https://${shopDomain}`, "_blank");
                await completeStepMutation.mutateAsync({
                    key: item.stepKey as SetupStepKey,
                    value: true,
                });
                setButtonLoading(null);
            } else if (item.primaryButton?.internalUrl) {
                goTo(item.primaryButton.internalUrl)();
            }
        },
        [items, shopDomain, apiKey, completeStepMutation, goTo],
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
                    shopify.toast.show("App embed is active");
                } else {
                    if (item.complete) {
                        await completeStepMutation.mutateAsync({
                            key: item.stepKey as SetupStepKey,
                            value: false,
                        });
                    }
                    shopify.toast.show("App embed is not enabled yet", {
                        isError: true,
                    });
                }
            } else if (item.secondaryButton?.internalUrl) {
                goTo(item.secondaryButton.internalUrl)();
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

        isGuideOpen,
        expanded,
        completedItemsLength,
        checkboxLoadingId,
        buttonLoading,

        dismissGuide: () => dismissMutation.mutateAsync(),
        showGuide: () => showMutation.mutateAsync(),
        toggleGuide,
        setExpanded: handleSetExpanded,
        onItemComplete: handleItemComplete,
        onPrimaryClick: handlePrimaryClick,
        onSecondaryClick: handleSecondaryClick,
    };
}
