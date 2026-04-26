"use client";

import React, { useEffect, useState } from "react";
import type { BundleStatus } from "@/features/bundles";
import {
    formatDateLong,
    getDisallowPastDates,
    ProBadge,
    useCrossSellStore,
    usePlan,
} from "@/shared";
import {
    BUNDLE_STATUSES,
    getAvailableStatuses,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";

export function BundlePreviewStatus() {
    const t = useTranslations("Bundles.Schedule");
    const ts = useTranslations("Bundles.Statuses");
    const { bundleData, updateBundleField } = useBundleStore(
        useShallow((s) => ({ bundleData: s.bundleData, updateBundleField: s.updateBundleField })),
    );
    const { plan } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const mode = bundleData.id ? "edit" : "create";
    const availableStatuses = getAvailableStatuses(mode);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const popover = document.getElementById("status-popover");

        if (!popover) {
            return;
        }

        const handleShow = () => setIsOpen(true);
        const handleHide = () => setIsOpen(false);

        popover.addEventListener("show", handleShow as EventListener);
        popover.addEventListener("hide", handleHide as EventListener);

        return () => {
            popover.removeEventListener("show", handleShow as EventListener);
            popover.removeEventListener("hide", handleHide as EventListener);
        };
    }, []);

    const toDate = (value: Date | string | undefined): Date | undefined => {
        if (!value) {
            return undefined;
        }

        if (value instanceof Date) {
            return value;
        }

        return new Date(value);
    };

    const handleStartDateChange = (value: string) => {
        updateBundleField("startDate", value ? new Date(value) : undefined);
    };

    const handleEndDateChange = (value: string) => {
        updateBundleField("endDate", value ? new Date(value) : undefined);
    };

    const getDateValue = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return "";
        return dateObj.toISOString().split("T")[0];
    };

    const formatDisplayDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return "";

        const dateStr = dateObj.toISOString().split("T")[0];
        return formatDateLong(dateStr);
    };

    const handleStatusChange = (newStatus: BundleStatus) => {
        updateBundleField("status", newStatus);
        if (newStatus !== "SCHEDULED") {
            updateBundleField("startDate", undefined);
            updateBundleField("endDate", undefined);
        }
    };

    const handleResetDates = () => {
        updateBundleField("startDate", undefined);
        updateBundleField("endDate", undefined);
    };

    const disallowPast = getDisallowPastDates();
    const hasDates = Boolean(bundleData.startDate);

    return (
        <s-section>
            <s-stack gap="small-200">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{t("status")}</s-heading>
                    <s-tooltip id="widget-layout-tooltip">
                        <s-text>{t("statusTooltip")}</s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="widget-layout-tooltip"
                    />
                </s-stack>

                <div
                    className={`relative ${isOpen ? "rtpb-active-shadow" : "rtpb-normal-shadow"}`}
                >
                    <s-clickable
                        command="--toggle"
                        commandFor="status-popover"
                        borderWidth="small"
                        borderColor="strong"
                        borderRadius="base"
                        padding="small-300"
                        paddingInline="small"
                        type="submit"
                        accessibilityLabel={`${t("status")}: ${ts(bundleData.status ?? "DRAFT")}`}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        <div className="w-full flex justify-between items-center">
                            <s-text>
                                <div className="font-[550]">
                                    {ts(bundleData.status ?? "DRAFT")}
                                </div>
                            </s-text>
                            <div className="chevrons flex flex-col relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 fill-[rgba(97,97,97,1)]"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path d="M8.884 2.323a1.25 1.25 0 0 0-1.768 0l-2.646 2.647a.749.749 0 1 0 1.06 1.06l2.47-2.47 2.47 2.47a.749.749 0 1 0 1.06-1.06z"></path>
                                    <path d="m11.53 11.03-2.646 2.647a1.25 1.25 0 0 1-1.768 0l-2.646-2.647a.749.749 0 1 1 1.06-1.06l2.47 2.47 2.47-2.47a.749.749 0 1 1 1.06 1.06"></path>
                                </svg>
                            </div>
                        </div>
                    </s-clickable>
                </div>

                <s-popover id="status-popover">
                    <div className="p-2 w-88.75">
                        <s-stack gap="small-400">
                            {availableStatuses.map((key) => {
                                const isLocked =
                                    !plan.limits.allowedStatuses.includes(key);

                                return (
                                    <s-clickable
                                        key={key}
                                        command={
                                            isLocked ? undefined : "--hide"
                                        }
                                        commandFor={
                                            isLocked
                                                ? undefined
                                                : "status-popover"
                                        }
                                        borderRadius="base"
                                        onClick={() => {
                                            if (isLocked) {
                                                openCrossSell(ts(key));
                                            } else {
                                                handleStatusChange(key);
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <div
                                            className={`py-1 px-2 rounded-md transition-colors ${
                                                isLocked
                                                    ? "rtpb-pro-locked"
                                                    : bundleData.status === key
                                                      ? "bg-[#ebebeb]"
                                                      : "hover:bg-[#f7f7f7]"
                                            }`}
                                        >
                                            <s-stack
                                                gap="none"
                                                direction="inline"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <s-stack gap="none">
                                                    <s-heading>
                                                        {ts(key)}
                                                    </s-heading>
                                                    <s-paragraph color="subdued">
                                                        {ts(`${key}_desc`)}
                                                    </s-paragraph>
                                                </s-stack>
                                                {isLocked && (
                                                    <ProBadge label={ts(key)} />
                                                )}
                                            </s-stack>
                                        </div>
                                    </s-clickable>
                                );
                            })}
                        </s-stack>
                    </div>
                </s-popover>

                {mode === "edit" &&
                    bundleData.status &&
                    bundleData.status !== "ACTIVE" && (
                        <s-banner
                            tone={
                                bundleData.status === "SCHEDULED"
                                    ? "info"
                                    : "warning"
                            }
                        >
                            {bundleData.status === "SCHEDULED"
                                ? bundleData.startDate
                                    ? t("notLiveScheduledOn", {
                                          date: formatDisplayDate(
                                              bundleData.startDate,
                                          ),
                                      })
                                    : t("notLiveScheduled")
                                : t(
                                      bundleData.status === "DRAFT"
                                          ? "notLiveDraft"
                                          : bundleData.status === "PAUSED"
                                            ? "notLivePaused"
                                            : "notLiveArchived",
                                  )}
                            {(bundleData.status === "DRAFT" ||
                                bundleData.status === "PAUSED") && (
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() => handleStatusChange("ACTIVE")}
                                >
                                    {t("setToActive")}
                                </s-button>
                            )}
                        </s-banner>
                    )}

                {bundleData.status === "SCHEDULED" && (
                    <s-stack gap="small">
                        <s-text color="subdued">{t("dateRangeHint")}</s-text>

                        <s-stack
                            direction="inline"
                            gap="small-300"
                            alignItems="center"
                        >
                            <s-button
                                commandFor="date-popover"
                                variant="secondary"
                            >
                                {bundleData.startDate ? (
                                    <s-stack
                                        direction="inline"
                                        alignItems="center"
                                        gap="small-300"
                                    >
                                        <s-icon type="calendar" />
                                        {formatDisplayDate(
                                            bundleData.startDate,
                                        )}
                                        {bundleData.endDate && (
                                            <>
                                                <s-icon type="arrow-right" />
                                                <s-icon type="calendar" />
                                                {formatDisplayDate(
                                                    bundleData.endDate,
                                                )}
                                            </>
                                        )}
                                    </s-stack>
                                ) : (
                                    <s-stack
                                        direction="inline"
                                        alignItems="center"
                                        gap="small-300"
                                    >
                                        <s-icon type="calendar" />
                                        {t("setDates")}
                                    </s-stack>
                                )}
                            </s-button>
                            {hasDates && (
                                <s-button
                                    variant="tertiary"
                                    tone="critical"
                                    onClick={handleResetDates}
                                    accessibilityLabel={t("resetDates")}
                                    interestFor="schedule-tooltip"
                                >
                                    <s-tooltip id="schedule-tooltip">
                                        <s-text>{t("resetDates")}</s-text>
                                    </s-tooltip>
                                    <s-icon type="reset" />
                                </s-button>
                            )}
                        </s-stack>

                        <s-popover id="date-popover">
                            <s-box padding="base">
                                <s-stack gap="base">
                                    <s-heading>{t("scheduleBundle")}</s-heading>
                                    <s-stack direction="inline" gap="base">
                                        <s-stack gap="small-300" alignItems="center">
                                            <s-heading>
                                                {t("startDate")}{" "}
                                                <span style={{ color: "var(--p-color-text-critical)" }}>*</span>
                                            </s-heading>
                                            <s-date-picker
                                                type="single"
                                                disallow={disallowPast}
                                                value={getDateValue(
                                                    bundleData.startDate,
                                                )}
                                                onChange={(e: any) =>
                                                    handleStartDateChange(
                                                        e.value ??
                                                            e.currentTarget
                                                                ?.value ??
                                                            "",
                                                    )
                                                }
                                            />
                                        </s-stack>
                                        <s-stack gap="small-300" alignItems="center">
                                            <s-heading>
                                                {t("endDate")}{" "}
                                                <s-text color="subdued">
                                                    ({t("optional")})
                                                </s-text>
                                            </s-heading>
                                            <s-date-picker
                                                type="single"
                                                disallow={disallowPast}
                                                value={getDateValue(
                                                    bundleData.endDate,
                                                )}
                                                onChange={(e: any) =>
                                                    handleEndDateChange(
                                                        e.value ??
                                                            e.currentTarget
                                                                ?.value ??
                                                            "",
                                                    )
                                                }
                                            />
                                        </s-stack>
                                    </s-stack>
                                </s-stack>
                            </s-box>
                        </s-popover>

                        {!bundleData.startDate ? (
                            <s-banner tone="info">{t("dateRequired")}</s-banner>
                        ) : null}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
