"use client";

import type { BundleStatus } from "@/features/bundles";
import {
    BUNDLE_STATUSES,
    getAvailableStatuses,
    useBundleStore,
} from "@/features/bundles";
import { formatDateLong } from "@/shared";
import React from "react";

/**
 * Bundle status selector with optional date scheduling.
 */
export function BundlePreviewStatus() {
    const { bundleData, updateBundleField } = useBundleStore();

    // Determine mode based on whether bundleData.id exists
    const mode = bundleData.id ? "edit" : "create";
    const availableStatuses = getAvailableStatuses(mode);

    /**
     * Converts a date value to a Date object.
     */
    const toDate = (value: Date | string | undefined): Date | undefined => {
        if (!value) {
            return undefined;
        }

        if (value instanceof Date) {
            return value;
        }

        return new Date(value);
    };

    /**
     * Handles date range picker changes.
     */
    const handleDateChange = (value: string) => {
        if (!value || !value.includes("--")) {
            updateBundleField("startDate", undefined);
            updateBundleField("endDate", undefined);
            return;
        }

        const [start, end] = value.split("--");
        // Convert string to Date for zod schema compatibility
        updateBundleField("startDate", start ? new Date(start) : undefined);
        updateBundleField("endDate", end ? new Date(end) : undefined);
    };

    /**
     * Formats date value for the date picker.
     * Returns format: YYYY-MM-DD--YYYY-MM-DD
     */
    const getDatePickerValue = (): string => {
        const start = toDate(bundleData.startDate);
        const end = toDate(bundleData.endDate);

        if (!start || !end) return "";

        // Handle Date objects
        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        return `${startStr}--${endStr}`;
    };

    /**
     * Formats date for human-readable display.
     */
    const formatDisplayDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return "";

        const dateStr = dateObj.toISOString().split("T")[0];
        return formatDateLong(dateStr);
    };

    /**
     * Handles status change.
     */
    const handleStatusChange = (newStatus: BundleStatus) => {
        updateBundleField("status", newStatus);

        // Clear dates if not scheduled
        if (newStatus !== "SCHEDULED") {
            updateBundleField("startDate", undefined);
            updateBundleField("endDate", undefined);
        }
    };

    /**
     * Resets both start and end dates.
     */
    const handleResetDates = () => {
        updateBundleField("startDate", undefined);
        updateBundleField("endDate", undefined);
    };

    // Check if dates are set
    const hasDates = bundleData.startDate && bundleData.endDate;

    return (
        <s-section>
            <s-stack gap="base">
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

                <s-select
                    label="Bundle status"
                    value={bundleData.status || "DRAFT"}
                    onChange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        handleStatusChange(target.value as BundleStatus);
                    }}
                    labelAccessibilityVisibility="exclusive"
                >
                    {availableStatuses.map((key) => (
                        <s-option key={key} value={key}>
                            {BUNDLE_STATUSES[key].text}
                        </s-option>
                    ))}
                </s-select>

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
