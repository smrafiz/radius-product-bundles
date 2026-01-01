"use client";

import {
    getInitialRangeForDays,
    getLabelForDays,
    getPresetForDays,
    parseDate,
    isValidDateString,
} from "@/features/analytics/utils";
import { useShopSettings } from "@/shared";
import { useState, useEffect } from "react";
import { useAnalyticsStore } from "@/features/analytics";

/**
 * Date range picker hook
 */
export function useDateRangePicker() {
    const { days, startDate, endDate } = useAnalyticsStore();
    const { timezone, isInitialized } = useShopSettings();

    // Calculate the initial range fresh each time
    const initialRange = getInitialRangeForDays(days);

    // Use store values if available, otherwise use calculated range
    const defaultRange =
        startDate && endDate
            ? { start: startDate, end: endDate }
            : initialRange;

    // Local state
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState(defaultRange);
    const [startInput, setStartInput] = useState(defaultRange.start);
    const [endInput, setEndInput] = useState(defaultRange.end);
    const [label] = useState(getLabelForDays(days));
    const [activePreset, setActivePreset] = useState(getPresetForDays(days));

    // initialize store ONLY when shop settings are ready
    useEffect(() => {
        if (isInitialized && (!startDate || !endDate)) {
            const range = getInitialRangeForDays(days);
            console.log(
                "🔍 Initializing store with timezone:",
                timezone,
                "range:",
                range,
            );
            useAnalyticsStore.getState().setDateRange(range.start, range.end);
        }
    }, [isInitialized, startDate, endDate, days, timezone]);

    // Recalculate when the timezone becomes available
    useEffect(() => {
        if (timezone && startDate && endDate) {
            const correctRange = getInitialRangeForDays(days);

            if (
                startDate !== correctRange.start ||
                endDate !== correctRange.end
            ) {
                console.log(
                    "🔍 Timezone changed, recalculating range:",
                    correctRange,
                );
                useAnalyticsStore
                    .getState()
                    .setDateRange(correctRange.start, correctRange.end);
            }
        }
    }, [timezone]);

    // Update local state when store changes
    useEffect(() => {
        if (startDate && endDate) {
            setRange({ start: startDate, end: endDate });
            setStartInput(startDate);
            setEndInput(endDate);
        }
    }, [startDate, endDate]);

    // Listen to popover show/hide events
    useEffect(() => {
        const popover = document.getElementById("analytics-date-popover");

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

    // Update inputs when range changes from the calendar
    useEffect(() => {
        setStartInput(range.start);
        setEndInput(range.end);
    }, [range]);

    /**
     * Handle start date input change
     */
    const handleStartInputChange = (value: string) => {
        setStartInput(value);

        if (isValidDateString(value)) {
            const date = parseDate(value);
            if (!isNaN(date.getTime())) {
                setRange((prev) => ({ ...prev, start: value }));
                setActivePreset("custom");
            }
        }
    };

    /**
     * Handle end-date input change
     */
    const handleEndInputChange = (value: string) => {
        setEndInput(value);

        if (isValidDateString(value)) {
            const date = parseDate(value);
            if (!isNaN(date.getTime())) {
                setRange((prev) => ({ ...prev, end: value }));
                setActivePreset("custom");
            }
        }
    };

    /**
     * Handle preset selection
     */
    const handlePresetClick = (preset: {
        key: string;
        getValue: () => { start: string; end: string };
    }) => {
        const value = preset.getValue();
        setRange(value);
        setStartInput(value.start);
        setEndInput(value.end);
        setActivePreset(preset.key);
    };

    /**
     * Handle calendar range change
     */
    const handleCalendarChange = (newRange: { start: string; end: string }) => {
        setRange(newRange);
        setActivePreset("custom");
    };

    /**
     * Validate date range
     */
    const isValidRange = (): boolean => {
        if (!isValidDateString(startInput) || !isValidDateString(endInput)) {
            return false;
        }

        const start = parseDate(startInput);
        const end = parseDate(endInput);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
        }

        return start <= end;
    };

    /**
     * Apply date range to store
     */
    const handleApply = (event: any) => {
        if (!isValidRange()) {
            event.preventDefault();
            event.stopPropagation();
            console.error("Invalid date range");
            return;
        }

        useAnalyticsStore.getState().setDateRange(range.start, range.end);
    };

    /**
     * Reset to initial range
     */
    const handleCancel = () => {
        const resetRange =
            startDate && endDate
                ? { start: startDate, end: endDate }
                : initialRange;

        setRange(resetRange);
        setStartInput(resetRange.start);
        setEndInput(resetRange.end);
        setActivePreset(getPresetForDays(days));
    };

    return {
        isOpen,
        range,
        startInput,
        endInput,
        label,
        activePreset,
        handleStartInputChange,
        handleEndInputChange,
        handlePresetClick,
        handleCalendarChange,
        handleApply,
        handleCancel,
        isValidRange,
    };
}
