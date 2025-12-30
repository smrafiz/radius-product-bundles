"use client";

import React, { useState } from "react";
import "./custom-calendar.css";

interface CustomCalendarProps {
    value: { start: string; end: string };
    onChange: (range: { start: string; end: string }) => void;
}

/**
 * Custom dual-month calendar for date range selection
 *
 * Uses semantic table structure for accessibility, matching Shopify Analytics design.
 */
export function CustomCalendar({ value, onChange }: CustomCalendarProps) {
    const [leftMonth, setLeftMonth] = useState(() => {
        const d = new Date(value.start || new Date());
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [selectingStart, setSelectingStart] = useState(true);

    const today = new Date();
    const format = (date: Date) => date.toISOString().split("T")[0];

    // Calculate right month (next month from left)
    const rightMonth = new Date(
        leftMonth.getFullYear(),
        leftMonth.getMonth() + 1,
        1,
    );

    /**
     * Navigate months (moves both calendars together)
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
     * Handle date click with proper 3-click behavior:
     * Click 1: Set start date
     * Click 2: Set end date
     * Click 3: Reset and set new start date
     */
    const handleDateClick = (date: Date) => {
        const dateStr = format(date);

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
     * Check if date is in range (including hover preview)
     */
    const isInRange = (date: Date) => {
        const dateStr = format(date);
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

    const isRangeStart = (date: Date) => format(date) === value.start;
    const isRangeEnd = (date: Date) => format(date) === value.end;
    const isToday = (date: Date) => format(date) === format(today);

    /**
     * Render calendar month as a semantic table
     */
    const renderCalendar = (month: Date) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const monthName = month.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });

        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const weeks = [];
        let currentWeek = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push(
                <td
                    key={`empty-${i}`}
                    className="custom-calendar-empty-cell"
                />,
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dateStr = format(date);
            const isTodayDate = isToday(date);
            const inRange = isInRange(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);

            const dayLabel = date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            });

            currentWeek.push(
                <td
                    key={day}
                    className={`custom-calendar-day-cell ${inRange ? "custom-calendar-day-cell--in-range" : ""}`}
                >
                    <button
                        type="button"
                        className={`
                            custom-calendar-day
                            ${isTodayDate ? "custom-calendar-day--today" : ""}
                            ${inRange ? "custom-calendar-day--in-range" : ""}
                            ${isStart ? "custom-calendar-day--range-start" : ""}
                            ${isEnd ? "custom-calendar-day--range-end" : ""}
                            ${isStart && isEnd ? "custom-calendar-day--single" : ""}
                        `.trim()}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() =>
                            !selectingStart && setHoverDate(dateStr)
                        }
                        onMouseLeave={() => setHoverDate(null)}
                        aria-label={dayLabel}
                        aria-pressed={isStart || isEnd}
                    >
                        {day}
                    </button>
                </td>,
            );

            // Start new week on Sunday
            if ((startDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
                // Fill remaining cells if last week of month
                if (day === daysInMonth) {
                    const remaining = 7 - (currentWeek.length % 7);
                    if (remaining < 7) {
                        for (let i = 0; i < remaining; i++) {
                            currentWeek.push(
                                <td
                                    key={`empty-end-${i}`}
                                    className="custom-calendar-empty-cell"
                                />,
                            );
                        }
                    }
                }
                weeks.push([...currentWeek]);
                currentWeek = [];
            }
        }

        return (
            <div className="custom-calendar-month">
                <table role="grid" className="custom-calendar-table">
                    <caption className="custom-calendar-caption">
                        {monthName}
                    </caption>
                    <thead>
                        <tr>
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day, i) => (
                                    <th
                                        key={day}
                                        scope="col"
                                        className="custom-calendar-weekday"
                                        aria-label={
                                            [
                                                "Sunday",
                                                "Monday",
                                                "Tuesday",
                                                "Wednesday",
                                                "Thursday",
                                                "Friday",
                                                "Saturday",
                                            ][i]
                                        }
                                    >
                                        {day}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, i) => (
                            <tr key={i} className="custom-calendar-week">
                                {week}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="custom-calendar-container">
            <div className="custom-calendar-navigation">
                <button
                    type="button"
                    className="custom-calendar-nav-btn"
                    onClick={() => navigateMonth("prev")}
                    aria-label="Previous month"
                >
                    <s-icon type="arrow-left" tone="neutral" />
                </button>
                <button
                    type="button"
                    className="custom-calendar-nav-btn"
                    onClick={() => navigateMonth("next")}
                    aria-label="Next month"
                >
                    <s-icon type="arrow-right" tone="neutral" />
                </button>
            </div>

            <div className="custom-calendar-months">
                {renderCalendar(leftMonth)}
                {renderCalendar(rightMonth)}
            </div>
        </div>
    );
}
