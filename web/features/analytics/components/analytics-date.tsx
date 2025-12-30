"use client";

import React, { useEffect, useState } from "react";
import { useAnalyticsStore } from "@/features/analytics";
import { CustomCalendar } from "@/features/analytics/components/analytics-calender/analytics-calender";

/**
 * Analytics date range picker
 *
 * Shopify-style date picker with custom calendar and Polaris components.
 */
export function AnalyticsDate() {
    const { days } = useAnalyticsStore();
    const [isOpen, setIsOpen] = useState(false);

    const format = (date: Date) => date.toISOString().split("T")[0];
    const parseDate = (dateStr: string) => new Date(dateStr + "T00:00:00");
    const today = new Date();

    // ==== PRESET RANGE FUNCTIONS ====
    const getToday = () => {
        const d = format(today);
        return { start: d, end: d };
    };

    const getYesterday = () => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const d = format(y);
        return { start: d, end: d };
    };

    const getLast7Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { start: format(start), end };
    };

    const getLast30Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return { start: format(start), end };
    };

    const getLast90Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 89);
        return { start: format(start), end };
    };

    const getLast365Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 364);
        return { start: format(start), end };
    };

    const getLastWeek = () => {
        const end = new Date(today);
        end.setDate(end.getDate() - end.getDay()); // Last Sunday
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { start: format(start), end: format(end) };
    };

    const getLastMonth = () => {
        const lastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1,
        );
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: format(lastMonth), end: format(lastDay) };
    };

    // Get initial value
    const getInitialValue = () => {
        switch (days) {
            case 1:
                return getToday();
            case 7:
                return getLast7Days();
            case 30:
                return getLast30Days();
            case 90:
                return getLast90Days();
            case 365:
                return getLast365Days();
            default:
                return getLast30Days();
        }
    };

    // Local state
    const [range, setRange] = useState(getInitialValue());
    const [startInput, setStartInput] = useState(range.start);
    const [endInput, setEndInput] = useState(range.end);
    const [label, setLabel] = useState(getLabelForDays(days));
    const [activePreset, setActivePreset] = useState(getPresetForDays(days));

    // Update inputs when range changes
    useEffect(() => {
        setStartInput(range.start);
        setEndInput(range.end);
    }, [range]);

    /**
     * Get label for number of days
     */
    function getLabelForDays(d: number): string {
        switch (d) {
            case 1:
                return "Today";
            case 7:
                return "Last 7 days";
            case 30:
                return "Last 30 days";
            case 90:
                return "Last 90 days";
            case 365:
                return "Last 365 days";
            default:
                return `Last ${d} days`;
        }
    }

    /**
     * Get preset key for number of days
     */
    function getPresetForDays(d: number): string {
        switch (d) {
            case 1:
                return "today";
            case 7:
                return "last7";
            case 30:
                return "last30";
            case 90:
                return "last90";
            case 365:
                return "last365";
            default:
                return "last30";
        }
    }

    // Preset buttons
    const presets = [
        { key: "today", label: "Today", getValue: getToday },
        { key: "yesterday", label: "Yesterday", getValue: getYesterday },
        { key: "last7", label: "Last 7 days", getValue: getLast7Days },
        { key: "last30", label: "Last 30 days", getValue: getLast30Days },
        { key: "last90", label: "Last 90 days", getValue: getLast90Days },
        { key: "last365", label: "Last 365 days", getValue: getLast365Days },
        { key: "lastWeek", label: "Last week", getValue: getLastWeek },
        { key: "lastMonth", label: "Last month", getValue: getLastMonth },
    ];

    /**
     * Handle preset click
     */
    const handlePresetClick = (preset: (typeof presets)[0]) => {
        const value = preset.getValue();
        setRange(value);
        setActivePreset(preset.key);
    };

    /**
     * Handle manual date input
     */
    const handleStartInputChange = (event: any) => {
        const value = event.currentTarget.value;
        setStartInput(value);

        // Validate and update range
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = parseDate(value);
            if (!isNaN(date.getTime())) {
                setRange((prev) => ({ ...prev, start: value }));
                setActivePreset("custom");
            }
        }
    };

    const handleEndInputChange = (event: any) => {
        const value = event.currentTarget.value;
        setEndInput(value);

        // Validate and update range
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = parseDate(value);
            if (!isNaN(date.getTime())) {
                setRange((prev) => ({ ...prev, end: value }));
                setActivePreset("custom");
            }
        }
    };

    /**
     * Handle Apply
     */
    const handleApply = () => {
        useAnalyticsStore.getState().setDateRange(range.start, range.end);
        setIsOpen(false);
    };

    /**
     * Handle Cancel
     */
    const handleCancel = () => {
        const initial = getInitialValue();
        setRange(initial);
        setIsOpen(false);
    };

    return (
        <s-stack gap="base">
            <s-button
                commandFor="analytics-date-popover"
                variant="secondary"
                onClick={() => setIsOpen(!isOpen)}
            >
                <s-stack direction="inline" alignItems="center" gap="small-300">
                    <s-icon type="calendar" />
                    <s-text>{label}</s-text>
                </s-stack>
            </s-button>

            <s-popover id="analytics-date-popover">
                <s-box padding="base">
                    <s-stack gap="base">
                        {/* Date Range Inputs */}
                        <s-stack
                            direction="inline"
                            gap="small"
                            alignItems="center"
                        >
                            <s-text-field
                                label="Start Date"
                                labelAccessibilityVisibility="exclusive"
                                value={startInput}
                                placeholder="YYYY-MM-DD"
                                onChange={handleStartInputChange}
                            />
                            <s-icon type="arrow-right" tone="neutral" />
                            <s-text-field
                                label="End Date"
                                labelAccessibilityVisibility="exclusive"
                                value={endInput}
                                placeholder="YYYY-MM-DD"
                                onChange={handleEndInputChange}
                            />
                        </s-stack>

                        {/* Main Content: Presets + Calendar */}
                        <s-stack
                            direction="inline"
                            gap="base"
                            alignItems="start"
                        >
                            {/* Preset Buttons */}
                            <s-stack gap="small-200">
                                {presets.map((preset) => (
                                    <s-button
                                        key={preset.key}
                                        variant={
                                            activePreset === preset.key
                                                ? "secondary"
                                                : "tertiary"
                                        }
                                        onClick={() =>
                                            handlePresetClick(preset)
                                        }
                                    >
                                        <s-stack
                                            direction="inline"
                                            justifyContent="space-between"
                                        >
                                            <s-text>{preset.label}</s-text>
                                            {activePreset === preset.key && (
                                                <s-text>✓</s-text>
                                            )}
                                        </s-stack>
                                    </s-button>
                                ))}
                            </s-stack>

                            {/* Vertical Divider */}
                            <div
                                style={{
                                    width: "1px",
                                    background:
                                        "var(--p-color-border-subdued, #e1e3e5)",
                                    alignSelf: "stretch",
                                }}
                            />

                            {/* Custom Calendar */}
                            <CustomCalendar
                                value={range}
                                onChange={(newRange) => {
                                    setRange(newRange);
                                    setActivePreset("custom");
                                }}
                            />
                        </s-stack>
                        <s-divider direction="inline" />

                        {/* Action Buttons */}
                        <s-stack
                            direction="inline"
                            justifyContent="end"
                            gap="small"
                        >
                            <s-button
                                variant="secondary"
                                onClick={handleCancel}
                            >
                                Cancel
                            </s-button>
                            <s-button variant="primary" onClick={handleApply}>
                                Apply
                            </s-button>
                        </s-stack>
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
}
