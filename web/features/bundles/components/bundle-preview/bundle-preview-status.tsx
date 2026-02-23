"use client";

import React, { useEffect, useState } from "react";
import type { BundleStatus } from "@/features/bundles";
import { formatDateLong, getDisallowPastDates } from "@/shared";
import { BUNDLE_STATUSES, getAvailableStatuses, useBundleStore, } from "@/features/bundles";

export function BundlePreviewStatus() {
    const { bundleData, updateBundleField } = useBundleStore();
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

    const handleDateChange = (value: string) => {
        if (!value || !value.includes("--")) {
            updateBundleField("startDate", undefined);
            updateBundleField("endDate", undefined);
            return;
        }

        const [start, end] = value.split("--");
        updateBundleField("startDate", start ? new Date(start) : undefined);
        updateBundleField("endDate", end ? new Date(end) : undefined);
    };

    const getDatePickerValue = (): string => {
        const start = toDate(bundleData.startDate);
        const end = toDate(bundleData.endDate);

        if (!start || !end) return "";

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        return `${startStr}--${endStr}`;
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
    const hasDates = bundleData.startDate && bundleData.endDate;

    return (
        <s-section>
            <s-stack gap="small-200">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Bundle status</s-heading>
                    <s-tooltip id="widget-layout-tooltip">
                        <s-text>
                            Shows the current state of this bundle and how it
                            appears in your store.
                        </s-text>
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
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        <div className="w-full flex justify-between items-center">
                            <s-text>
                                <div className="font-[550]">
                                    {
                                        BUNDLE_STATUSES[
                                            bundleData.status ?? "DRAFT"
                                        ].text
                                    }
                                </div>
                            </s-text>
                            <div className="chevrons flex flex-col relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 fill-[rgba(97,97,97,1)]"
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
                            {availableStatuses.map((key) => (
                                <s-clickable
                                    key={key}
                                    command="--hide"
                                    commandFor="status-popover"
                                    borderRadius="base"
                                    onClick={() => {
                                        handleStatusChange(key);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div
                                        className={`py-1 px-2 rounded-md transition-colors
                                            ${bundleData.status === key ? "bg-[#ebebeb]" : "hover:bg-[#f7f7f7]"}`}
                                    >
                                        <s-stack gap="none">
                                            <s-heading>
                                                {BUNDLE_STATUSES[key].text}
                                            </s-heading>
                                            <s-paragraph color="subdued">
                                                {BUNDLE_STATUSES[key].desc}
                                            </s-paragraph>
                                        </s-stack>
                                    </div>
                                </s-clickable>
                            ))}
                        </s-stack>
                    </div>
                </s-popover>

                {bundleData.status === "SCHEDULED" && (
                    <s-stack gap="small">
                        <s-text color="subdued">
                            Set the date range when this bundle will be active.
                        </s-text>

                        <s-stack
                            direction="inline"
                            gap="small-300"
                            alignItems="center"
                        >
                            <s-button
                                commandFor="date-popover"
                                variant="secondary"
                            >
                                {bundleData.startDate && bundleData.endDate ? (
                                    <s-stack
                                        direction="inline"
                                        alignItems="center"
                                        gap="small-300"
                                    >
                                        <s-icon type="calendar" />
                                        {formatDisplayDate(
                                            bundleData.startDate,
                                        )}
                                        <s-icon type="arrow-right" />
                                        <s-icon type="calendar" />
                                        {formatDisplayDate(bundleData.endDate)}
                                    </s-stack>
                                ) : (
                                    <s-stack
                                        direction="inline"
                                        alignItems="center"
                                        gap="small-300"
                                    >
                                        <s-icon type="calendar" />
                                        Set schedule dates
                                    </s-stack>
                                )}
                            </s-button>
                            {hasDates && (
                                <s-button
                                    variant="tertiary"
                                    tone="critical"
                                    onClick={handleResetDates}
                                    accessibilityLabel="Reset dates"
                                    interestFor="schedule-tooltip"
                                >
                                    <s-tooltip id="schedule-tooltip">
                                        <s-text>Reset dates</s-text>
                                    </s-tooltip>
                                    <s-icon type="reset" />
                                </s-button>
                            )}
                        </s-stack>

                        <s-popover id="date-popover">
                            <s-box padding="base">
                                <s-stack gap="base">
                                    <s-heading>Schedule bundle</s-heading>
                                    <s-date-picker
                                        type="range"
                                        disallow={disallowPast}
                                        value={getDatePickerValue()}
                                        onChange={(e: any) =>
                                            handleDateChange(
                                                e.value ??
                                                    e.currentTarget?.value ??
                                                    "",
                                            )
                                        }
                                    />
                                </s-stack>
                            </s-box>
                        </s-popover>

                        {!bundleData.startDate || !bundleData.endDate ? (
                            <s-banner tone="info">
                                Please set both start and end dates for
                                scheduled bundles.
                            </s-banner>
                        ) : null}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
