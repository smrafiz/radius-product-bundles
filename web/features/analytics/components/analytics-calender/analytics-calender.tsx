"use client";

import React from "react";
import {
    AnalyticsCalendarProps,
    formatDate,
    useCalendar,
} from "@/features/analytics";

import "@/styles/components/calendar.css";

/**
 * Custom dual-month calendar component
 */
export function AnalyticsCalendar({
    value,
    onChange,
    onStartInputChange,
    onEndInputChange,
    startInput,
    endInput,
}: AnalyticsCalendarProps) {
    const {
        leftMonth,
        hoverDate,
        selectingStart,
        navigateMonth,
        handleDateClick,
        setHoverDate,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isToday,
        isHovered,
        isInMiddle,
    } = useCalendar(value, onChange);

    // Calculate right month
    const rightMonth = new Date(
        leftMonth.getFullYear(),
        leftMonth.getMonth() + 1,
        1,
    );

    /**
     * Handle input change events
     */
    const handleStartChange = (event: any) => {
        onStartInputChange?.(event.currentTarget.value);
    };

    const handleEndChange = (event: any) => {
        onEndInputChange?.(event.currentTarget.value);
    };

    /**
     * Render calendar month as semantic table
     */
    const renderCalendar = (month: Date) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const monthName = month.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });

        const today = new Date();
        const isCurrentMonth =
            year === today.getFullYear() && monthIndex === today.getMonth();
        const todayDayOfWeek = isCurrentMonth ? today.getDay() : -1;

        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const weeks = [];
        let currentWeek = [];

        // Empty cells before month starts
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
            const dateStr = formatDate(date);

            const dayLabel = date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            });

            const isTodayDate = isToday(date);
            const inRange = isInRange(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);
            const isHover = isHovered(date);
            const isMiddle = isInMiddle(date);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isFutureDate = date >= today;

            currentWeek.push(
                <td
                    key={day}
                    className={`custom-calendar-day-cell ${inRange ? "custom-calendar-day-cell--in-range" : ""}`}
                >
                    <button
                        type="button"
                        className={[
                            "custom-calendar-day",
                            isTodayDate && "custom-calendar-day--today",
                            inRange && "custom-calendar-day--in-range",
                            isStart && "custom-calendar-day--range-start",
                            isEnd && "custom-calendar-day--range-end",
                            isHover && "custom-calendar-day--hover-only",
                            isMiddle && "custom-calendar-day--middle",
                            isStart && isEnd && "custom-calendar-day--single",
                            isFutureDate && "custom-calendar-day--disabled",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() =>
                            !selectingStart && setHoverDate(dateStr)
                        }
                        onMouseLeave={() => setHoverDate(null)}
                        aria-label={dayLabel}
                        aria-pressed={isStart || isEnd}
                        disabled={isFutureDate}
                        aria-disabled={isFutureDate}
                    >
                        {day}
                    </button>
                </td>,
            );

            // Start new week on Sunday
            if ((startDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
                // Fill remaining cells if last week
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
            <table role="grid" className="custom-calendar-table">
                <caption className="custom-calendar-caption">
                    {monthName}
                </caption>
                <thead>
                    <tr>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                            (day, i) => {
                                const isTodayWeekday = i === todayDayOfWeek;

                                return (
                                    <th
                                        key={day}
                                        scope="col"
                                        className="custom-calendar-weekday"
                                        style={
                                            isTodayWeekday
                                                ? {
                                                      fontWeight: "650",
                                                      color: "initial",
                                                  }
                                                : undefined
                                        }
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
                                );
                            },
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
        );
    };

    return (
        <div className="custom-calendar-container">
            <s-box padding="none">
                {/* Date Inputs with Navigation */}
                <s-box
                    padding="small"
                    background="subdued"
                    inlineSize="100%"
                    border="base"
                    borderStyle="none none solid none"
                    borderColor="base"
                >
                    <s-stack direction="inline" gap="small" alignItems="center">
                        <div className="custom-calendar-input-group">
                            <s-text-field
                                label="Start Date"
                                labelAccessibilityVisibility="exclusive"
                                value={startInput}
                                placeholder="YYYY-MM-DD"
                                onChange={handleStartChange}
                            />
                        </div>

                        <s-icon type="arrow-right" tone="neutral" />

                        <div className="custom-calendar-input-group">
                            <s-text-field
                                label="End Date"
                                labelAccessibilityVisibility="exclusive"
                                value={endInput}
                                placeholder="YYYY-MM-DD"
                                onChange={handleEndChange}
                            />
                        </div>
                    </s-stack>
                </s-box>

                {/* Dual Calendar Months */}
                <div className="custom-calendar-months">
                    {/* Navigation Arrows */}
                    <div className="custom-calendar-navigation">
                        <s-box padding="small">
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                inlineSize="100%"
                            >
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
                            </s-stack>
                        </s-box>
                    </div>

                    <s-box padding="small">
                        <s-stack
                            direction="inline"
                            gap="base"
                            paddingBlockStart="small-300"
                            paddingBlockEnd="large-500"
                        >
                            <div className="custom-calendar-month">
                                {renderCalendar(leftMonth)}
                            </div>
                            <div className="custom-calendar-month">
                                {renderCalendar(rightMonth)}
                            </div>
                        </s-stack>
                    </s-box>
                </div>
            </s-box>
        </div>
    );
}
