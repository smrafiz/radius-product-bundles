"use client";

import { ReactNode, useState, useEffect } from "react";
import {
    formatDateLong,
    getDisallowPastDates,
    MODAL_CONTENT,
    useModalStore,
} from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Modal Host - Single Reusable Modal
 */
export function ModalHost() {
    const { modal, closeModal, setLoading, setError } = useModalStore();
    const t = useTranslations("Modals");
    const tc = useTranslations("Common");
    const ts = useTranslations("Bundles.Statuses");
    const [dateRange, setDateRange] = useState("");

    const isScheduledModal =
        modal.type === "status" &&
        "newStatus" in modal &&
        modal.newStatus === "SCHEDULED";

    // Reset date range when modal changes
    useEffect(() => {
        setDateRange("");
    }, [modal.type]);

    const disallowPast = getDisallowPastDates();

    // Parse range value "YYYY-MM-DD--YYYY-MM-DD"
    const [startDate, endDate] = dateRange.includes("--")
        ? dateRange.split("--")
        : ["", ""];
    const hasValidDates = Boolean(startDate && endDate);

    const handleConfirm = async () => {
        if (!modal || modal.type === null || !("onConfirm" in modal)) {
            return;
        }

        try {
            setError(null);
            setLoading(true);

            const data =
                isScheduledModal && hasValidDates
                    ? { startDate, endDate }
                    : undefined;

            await modal.onConfirm?.(data);

            const modalElement = document.getElementById(
                "radius-bundles-app-modal",
            ) as any;
            if (modalElement?.hideOverlay) {
                modalElement.hideOverlay();
            }

            setTimeout(() => {
                closeModal();
            }, 300);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const { heading, message, destructive } = MODAL_CONTENT(modal, t, ts);
    const hasActiveModal = modal && modal.type !== null;
    const isQuotaModal = hasActiveModal && modal.type === "quota-exceeded";

    const renderMessage = (message: ReactNode) => {
        if (typeof message !== "string") {
            return message;
        }

        const parts = message.split(/(<strong>|<\/strong>)/g);

        return parts.map((part, index) => {
            if (part === "<strong>" || part === "</strong>") {
                return null;
            }

            const isStrong = parts[index - 1] === "<strong>";
            return isStrong ? (
                <s-text key={index} type="strong">
                    {part}
                </s-text>
            ) : (
                <s-text key={index}>{part}</s-text>
            );
        });
    };

    // Always render the modal
    return (
        <s-modal
            id="radius-bundles-app-modal"
            accessibilityLabel="bundle app modal"
            heading={heading}
            size={isScheduledModal ? "small" : "base"}
        >
            {hasActiveModal && modal.error && (
                <s-banner tone="critical">
                    <s-text>{modal.error}</s-text>
                </s-banner>
            )}

            <s-text>{renderMessage(message)}</s-text>

            {isScheduledModal && (
                <s-box paddingBlockStart="base">
                    <s-stack gap="base">
                        <div className="flex flex-col items-center gap-4">
                            {hasValidDates ? (
                                <s-stack
                                    direction="inline"
                                    alignItems="center"
                                    gap="small-300"
                                >
                                    <s-icon type="calendar" />
                                    {formatDateLong(startDate)}
                                    <s-icon type="arrow-right" />
                                    <s-icon type="calendar" />
                                    {formatDateLong(endDate)}
                                </s-stack>
                            ) : (
                                <s-stack
                                    direction="inline"
                                    alignItems="center"
                                    gap="small-300"
                                >
                                    <s-icon type="calendar" />
                                    <s-text color="subdued">
                                        Select schedule dates
                                    </s-text>
                                </s-stack>
                            )}
                            <s-date-picker
                                type="range"
                                disallow={disallowPast}
                                value={dateRange}
                                onChange={(event: any) =>
                                    setDateRange(
                                        event.currentTarget.value ?? "",
                                    )
                                }
                            />
                        </div>
                    </s-stack>
                </s-box>
            )}

            {/* Secondary Action (Close) — hidden for quota modal */}
            {!isQuotaModal && (
                <s-button
                    slot="secondary-actions"
                    variant="secondary"
                    commandFor="radius-bundles-app-modal"
                    command="--hide"
                    onClick={closeModal}
                    disabled={hasActiveModal && modal.loading}
                >
                    {(hasActiveModal && "cancelText" in modal && modal.cancelText) ||
                        tc("cancel", undefined, "Cancel")}
                </s-button>
            )}

            {/* Primary Action (Confirm) */}
            <s-button
                slot="primary-action"
                variant="primary"
                tone={destructive ? "critical" : undefined}
                commandFor={isQuotaModal ? "radius-bundles-app-modal" : undefined}
                command={isQuotaModal ? "--hide" : undefined}
                onClick={isQuotaModal ? closeModal : handleConfirm}
                loading={!isQuotaModal && hasActiveModal && modal.loading}
                disabled={
                    (!isQuotaModal && hasActiveModal && modal.loading) ||
                    (isScheduledModal && !hasValidDates)
                }
            >
                {(hasActiveModal && modal.confirmText) ||
                    (destructive
                        ? tc("delete", undefined, "Delete")
                        : t("confirm", undefined, "Confirm"))}
            </s-button>
        </s-modal>
    );
}
