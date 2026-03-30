"use client";

import { useCallback } from "react";
import { useAppNavigation } from "@/shared/hooks/navigation";
import { usePlan } from "@/shared/hooks/plan/use-plan";
import { openQuotaExceededModal } from "@/shared/utils/helpers/modal";
import { useTranslations } from "@/lib/i18n/provider";

export function useCreateBundleNav() {
    const { bundleData } = useAppNavigation();
    const { isWithinQuota, quota } = usePlan();
    const t = useTranslations("Modals.quotaExceeded");

    const create = useCallback(
        (type?: string): (() => void | false) => {
            return () => {
                if (!isWithinQuota("bundles")) {
                    openQuotaExceededModal(quota.bundles, {
                        title: t("heading"),
                        message: t("message", { current: quota.bundles.current, limit: quota.bundles.limit }),
                        confirmText: t("confirm"),
                    });
                    return false;
                }
                bundleData.create(type)();
            };
        },
        [bundleData, isWithinQuota, quota.bundles, t],
    );

    return { create };
}
