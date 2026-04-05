"use client";

import { useGlobalBanner } from "@/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { useBillingStatus } from "@/features/pricing";

export function BillingConfirmation() {
    const t = useTranslations("Pricing.Confirmation");
    const searchParams = useSearchParams();
    const chargeId = searchParams.get("charge_id");
    const { confirmSubscription } = useBillingStatus();
    const { showSuccess, showError } = useGlobalBanner();
    const confirmed = useRef(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!chargeId || confirmed.current) return;
        confirmed.current = true;
        setConfirming(true);

        const run = async () => {
            try {
                await confirmSubscription(chargeId);
                showSuccess(t("success"));
            } catch {
                showError(t("error"));
            } finally {
                setConfirming(false);
            }
        };

        void run();
        // confirmed.current ref guards against double-execution in React Strict Mode.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chargeId, confirmSubscription, showSuccess, showError, t]);

    if (!chargeId) return null;

    if (confirming) {
        return (
            <s-banner tone="info" heading={t("activating")}>
                {t("activatingBody")}
            </s-banner>
        );
    }

    return null;
}
