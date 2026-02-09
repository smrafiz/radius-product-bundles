"use client";

import {
    setupGuideKeys,
    setupGuideQueries,
    SetupStepKey,
} from "@/features/dashboard";
import {
    dismissSetupGuideAction,
    showSetupGuideAction,
    updateSetupStepAction,
    verifyAppEmbedAction,
} from "@/features/dashboard/actions/setup-guide.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SETUP_GUIDE_STEPS } from "@/features/dashboard/constants/dashboard.constants";

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

    const verifyAppEmbedMutation = useMutation({
        mutationFn: async () => {
            const token = await app.idToken();
            const result = await verifyAppEmbedAction(token);
            if (result.status === "error") throw new Error(result.message);
            return result.data!;
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

    const progress = data?.progress;

    const items = SETUP_GUIDE_STEPS.map((step) => ({
        ...step,
        complete: progress ? progress[step.stepKey] : false,
    }));

    const allComplete = progress
        ? Object.values(progress).every(Boolean)
        : false;

    return {
        items,
        isLoading,
        dismissed: data?.dismissed ?? false,
        shopDomain: data?.shopDomain ?? "",
        allComplete,
        completeStep: (key: SetupStepKey, value: boolean) =>
            completeStepMutation.mutateAsync({ key, value }),
        verifyAppEmbed: () => verifyAppEmbedMutation.mutateAsync(),
        dismissGuide: () => dismissMutation.mutateAsync(),
        showGuide: () => showMutation.mutateAsync(),
        isVerifying: verifyAppEmbedMutation.isPending,
        isDismissing: dismissMutation.isPending,
        isShowing: showMutation.isPending,
    };
}
