"use client";

import { useState } from "react";
import { formatDate } from "@/features/analytics";

/**
 * Calendar hook
 *
 * Manages calendar state and date selection logic.
 */
export function useCalendar(
    value: { start: string; end: string },
    onChange: (range: { start: string; end: string }) => void,
) {
    const [leftMonth, setLeftMonth] = useState(() => {
        const d = new Date(value.start || new Date());
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [selectingStart, setSelectingStart] = useState(true);

    /**
     * Navigate months (prev/next)
     */
    const navigateMonth = (direction: "prev" | "next") => {
        setLeftMonth((prev) => {
            const newMonth = new Date(prev);
            newMonth.setMonth(
                newMonth.getMonth() + (direction === "next" ? 1 : -1),
            );
            return newMonth;
        });
    };

    /**
     * Handle date click with 3-click behavior
     */
    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);

        if (selectingStart) {
            // First click: Set start date
            onChange({ start: dateStr, end: dateStr });
            setSelectingStart(false);
        } else {
            // Second click: Set end date
            const start = new Date(value.start);
            if (date < start) {
                // If clicked date is before start, swap them
                onChange({ start: dateStr, end: value.start });
            } else {
                onChange({ start: value.start, end: dateStr });
            }
            // Third click will reset
            setSelectingStart(true);
        }
    };

    /**
     * Check if date is in range
     */
    const isInRange = (date: Date): boolean => {
        const dateStr = formatDate(date);
        if (!value.start) return false;

        // If selecting end and hovering, show preview range
        if (!selectingStart && hoverDate) {
            const start = value.start;
            const end = hoverDate;
            if (end < start) {
                return dateStr >= end && dateStr <= start;
            }
            return dateStr >= start && dateStr <= end;
        }

        // Show actual selected range
        if (!value.end) return dateStr === value.start;
        return dateStr >= value.start && dateStr <= value.end;
    };

    /**
     * Check if date is range start
     */
    const isRangeStart = (date: Date): boolean => {
        return formatDate(date) === value.start;
    };

    /**
     * Check if date is range end
     */
    const isRangeEnd = (date: Date): boolean => {
        return formatDate(date) === value.end;
    };

    /**
     * Check if date is today
     */
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return formatDate(date) === formatDate(today);
    };

    return {
        // State
        leftMonth,
        hoverDate,
        selectingStart,

        // Actions
        navigateMonth,
        handleDateClick,
        setHoverDate,

        // Checkers
        isInRange,
        isRangeStart,
        isRangeEnd,
        isToday,
    };
}
