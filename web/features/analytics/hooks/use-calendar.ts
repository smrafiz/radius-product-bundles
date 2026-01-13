"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/features/analytics/utils";

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
     * Reset calendar month to show the start date
     */
    const resetToStartDate = () => {
        if (value.start) {
            const d = new Date(value.start);
            setLeftMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        }
    };

    /**
     * Auto-update calendar month when value changes externally
     */
    useEffect(() => {
        if (value.start) {
            const currentMonth = new Date(value.start);
            const displayedMonth = leftMonth;

            // Check if the start date is in a different month than displayed
            if (
                currentMonth.getFullYear() !== displayedMonth.getFullYear() ||
                currentMonth.getMonth() !== displayedMonth.getMonth()
            ) {
                // Jump to the month containing the start date
                setLeftMonth(
                    new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1,
                    ),
                );
            }
        }
    }, [value.start]);

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
     * Handle date click with a 3-click behavior
     */
    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);

        if (selectingStart) {
            onChange({ start: dateStr, end: dateStr });
            setSelectingStart(false);
        } else {
            const start = new Date(value.start);

            if (date < start) {
                onChange({ start: dateStr, end: dateStr });
                setSelectingStart(false);
            } else {
                onChange({ start: value.start, end: dateStr });
                setSelectingStart(true);
            }
        }
    };

    /**
     * Check if date is in range (including hover preview)
     */
    const isInRange = (date: Date): boolean => {
        const dateStr = formatDate(date);
        if (!value.start) {
            return false;
        }

        if (!selectingStart && hoverDate) {
            const start = value.start;
            const end = hoverDate;

            if (end >= start) {
                return dateStr >= start && dateStr <= end;
            }

            return false;
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
     * Check if date is range end (includes hover preview)
     */
    const isRangeEnd = (date: Date): boolean => {
        const dateStr = formatDate(date);

        // If selecting end and hovering AFTER start
        if (!selectingStart && hoverDate && hoverDate >= value.start) {
            return dateStr === hoverDate;
        }

        return dateStr === value.end;
    };

    /**
     * Check if date is today
     */
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return formatDate(date) === formatDate(today);
    };

    /**
     * Check if date is being hovered (for backward hover style)
     */
    const isHovered = (date: Date): boolean => {
        const dateStr = formatDate(date);

        // Only show hover if selecting end and hovering BEFORE start
        if (!selectingStart && hoverDate && hoverDate < value.start) {
            return dateStr === hoverDate;
        }

        return false;
    };

    /**
     * Check if date is in middle of range (for border radius 0)
     */
    const isInMiddle = (date: Date): boolean => {
        const dateStr = formatDate(date);

        // If selecting end and hovering
        if (!selectingStart && hoverDate && hoverDate >= value.start) {
            return dateStr > value.start && dateStr < hoverDate;
        }

        // Actual range
        return !!(value.end && dateStr > value.start && dateStr < value.end);
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
        resetToStartDate, // ✅ NEW: Export this function

        // Checkers
        isInRange,
        isRangeStart,
        isRangeEnd,
        isToday,
        isHovered,
        isInMiddle,
    };
}
