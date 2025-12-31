"use client";

import {
    getInitialRangeForDays,
    getLabelForDays,
    getPresetForDays,
    isValidDateString,
    parseDate,
    useAnalyticsStore
} from "@/features/analytics";
import { useEffect, useState } from "react";

/**
 * Date range picker hook
 *
 * Manages date range selection state and validation.
 */
export function useDateRangePicker() {
    const { days } = useAnalyticsStore();

    // Local state
    const [range, setRange] = useState(getInitialRangeForDays(days));
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
     * Handle end date input change
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
        setActivePreset(preset.key);
    };

    /**
     * Apply date range to store
     */
    const applyRange = () => {
        useAnalyticsStore.getState().setDateRange(range.start, range.end);
    };

    /**
     * Reset to initial range
     */
    const resetRange = () => {
        const initial = getInitialRangeForDays(days);
        setRange(initial);
    };

    return {
        // State
        range,
        startInput,
        endInput,
        label,
        activePreset,

        // Actions
        setRange,
        handleStartInputChange,
        handleEndInputChange,
        handlePresetClick,
        applyRange,
        resetRange,
    };
}
