"use client";

import { useEffect } from "react";
import {
    setupGuideKeys,
    setupGuideQueries,
    SetupStepKey,
} from "@/features/dashboard";
import {
    dismissSetupGuideAction,
    showSetupGuideAction,
    updateSetupStepAction,
} from "@/features/dashboard/actions/setup-guide.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SETUP_GUIDE_STEPS } from "@/features/dashboard/constants/dashboard.constants";
import { AUTO_DETECTED_STEPS } from "@/features/dashboard/constants/setup-guide.constants";

export function useSetupGuide() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = setupGuideQueries(app);

    const { data, isLoading } = useQuery(queries.progress());

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

    // Auto-detect app embed status via App Bridge
    useEffect(() => {
        if (!data || data.dismissed || data.progress.appEmbedEnabled) return;

        shopify.app.extensions().then((extensions) => {
            const themeExt = extensions.find(
                (e) => e.type === "theme_app_extension",
            );

            if (!themeExt) {
                return;
            }

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

    const items = SETUP_GUIDE_STEPS.map((step) => ({
        ...step,
        complete: progress ? progress[step.stepKey] : false,
        autoDetected: AUTO_DETECTED_STEPS.has(step.stepKey),
    }));

    const allComplete = progress
        ? Object.values(progress).every(Boolean)
        : false;

    return {
        items,
        isLoading,
        dismissed: data?.dismissed ?? false,
        shopDomain: data?.shopDomain ?? "",
        apiKey: data?.apiKey ?? "",
        allComplete,
        completeStep: (key: SetupStepKey, value: boolean) =>
            completeStepMutation.mutateAsync({ key, value }),
        dismissGuide: () => dismissMutation.mutateAsync(),
        showGuide: () => showMutation.mutateAsync(),
        isDismissing: dismissMutation.isPending,
        isShowing: showMutation.isPending,
    };
}
