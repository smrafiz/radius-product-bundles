"use client";
import React, { useState, useEffect } from "react";
import { formatDateLong } from "@/shared";

export function AnalyticsDate() {
    const format = (date: Date) => date.toISOString().split("T")[0];
    const today = new Date();

    // ==== PRESET RANGE FUNCTIONS ====
    const getToday = () => {
        const d = format(today);
        return `${d}--${d}`;
    };

    const getYesterday = () => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const d = format(y);
        return `${d}--${d}`;
    };

    const getLast7Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return `${format(start)}--${end}`;
    };

    const getLast30Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return `${format(start)}--${end}`;
    };

    const getLast90Days = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 89);
        return `${format(start)}--${end}`;
    };

    const getLastYear = () => {
        const end = format(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 364);
        return `${format(start)}--${end}`;
    };

    const getThisMonth = () => {
        const y = today.getFullYear();
        const m = (today.getMonth() + 1).toString().padStart(2, "0");
        const start = `${y}-${m}-01`;
        return `${start}--${format(today)}`;
    };

    // INITIAL VALUE
    const [value, setValue] = useState(getLast7Days());
    const [label, setLabel] = useState("Last 7 days");
    const [activePreset, setActivePreset] = useState("last7");

    // DYNAMIC VIEW (YYYY-MM)
    const [view, setView] = useState(() =>
        getLast7Days().split("--")[0].slice(0, 7),
    );

    const getStartEnd = (range: string) => {
        const [s, e] = range.split("--");
        return { start: s, end: e };
    };

    // AUTO-LABEL THE RANGE
    useEffect(() => {
        if (value === getToday()) setLabel("Today");
        else if (value === getYesterday()) setLabel("Yesterday");
        else if (value === getLast7Days()) setLabel("Last 7 days");
        else if (value === getLast30Days()) setLabel("Last 30 days");
        else if (value === getThisMonth()) setLabel("This month");
        else if (value === getLast90Days()) setLabel("Last 90 days");
        else if (value === getLastYear()) setLabel("Last Year");
        else {
            const { start, end } = getStartEnd(value);
            setLabel(`${start} → ${end}`);
        }
    }, [value]);

    // ==== BUTTON HANDLERS ====

    const setRangePreset = (preset: string, range: string) => {
        setActivePreset(preset);
        setValue(range);
        setView(range.split("--")[0].slice(0, 7));
    };

    const todayDays = () => setRangePreset("today", getToday());
    const yesTerDays = () => setRangePreset("yesterday", getYesterday());
    const last7Days = () => setRangePreset("last7", getLast7Days());
    const last30Days = () => setRangePreset("last30", getLast30Days());
    const thisMonth = () => setRangePreset("month", getThisMonth());
    const last90Days = () => setRangePreset("last90", getLast90Days());
    const last360Days = () => setRangePreset("year", getLastYear());

    const { start, end } = getStartEnd(value);

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
    const formatDisplayDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return "";

        const dateStr = dateObj.toISOString().split("T")[0];
        return formatDateLong(dateStr);
    };

    return (
        <s-stack gap="base">
            <s-button commandFor="date-popover" variant="secondary">
                <s-stack direction="inline" alignItems="center" gap="small-300">
                    <s-icon type="calendar" />
                    {label}
                </s-stack>
            </s-button>

            <s-popover id="date-popover">
                <s-box padding="base">
                    <s-stack gap="base">
                        <div className="flex gap-3 items-center">
                            <s-text-field
                                label="Start"
                                labelAccessibilityVisibility="exclusive"
                                value={formatDisplayDate(start)}
                            />
                            <s-stack paddingInlineEnd="small">
                                <s-icon size="base" type="arrow-right" />
                            </s-stack>
                            <s-text-field
                                label="End"
                                labelAccessibilityVisibility="exclusive"
                                value={formatDisplayDate(end)}
                            />
                        </div>
                        <s-stack gap="base" direction="inline">
                            <s-stack gap="small-200">
                                <s-button
                                    variant={activePreset === "today" ? "secondary" : "tertiary"}
                                    onClick={todayDays}
                                >
                                    Today
                                </s-button>

                                <s-button
                                    variant={activePreset === "yesterday" ? "secondary" : "tertiary"}
                                    onClick={yesTerDays}
                                >
                                    Yesterday
                                </s-button>

                                <s-button
                                    variant={activePreset === "last7" ? "secondary" : "tertiary"}
                                    onClick={last7Days}
                                >
                                    Last 7 days
                                </s-button>

                                <s-button
                                    variant={activePreset === "last30" ? "secondary" : "tertiary"}
                                    onClick={last30Days}
                                >
                                    Last 30 days
                                </s-button>

                                <s-button
                                    variant={activePreset === "month" ? "secondary" : "tertiary"}
                                    onClick={thisMonth}
                                >
                                    This month
                                </s-button>

                                <s-button
                                    variant={activePreset === "last90" ? "secondary" : "tertiary"}
                                    onClick={last90Days}
                                >
                                    Last 90 days
                                </s-button>

                                <s-button
                                    variant={activePreset === "year" ? "secondary" : "tertiary"}
                                    onClick={last360Days}
                                >
                                    Last Year
                                </s-button>
                            </s-stack>

                            <s-stack direction="inline" gap="large">
                                {/* LEFT CALENDAR (Start) */}
                                <s-date-picker
                                    type="range"
                                    view={value.split("--")[0].slice(0, 7)}
                                    value={value}
                                    onChange={(event) => {
                                        const v = event.currentTarget.value;
                                        setValue(v);
                                        setView(v.split("--")[0].slice(0, 7));
                                    }}
                                />

                                {/* RIGHT CALENDAR (End) */}
                                <s-date-picker
                                    type="range"
                                    view={value.split("--")[1].slice(0, 7)}
                                    value={value}
                                    onChange={(event) => {
                                        const v = event.currentTarget.value;
                                        setValue(v);
                                        setView(v.split("--")[0].slice(0, 7));
                                    }}
                                />
                            </s-stack>
                        </s-stack>

                        {/* Apply / Cancel Buttons */}
                        <s-stack direction="inline" justifyContent="end" gap="small">
                            <s-button
                                variant="secondary"
                                onClick={() => {
                                    setValue(getLast7Days());
                                    const popover = document.getElementById("date-popover");
                                    if (popover) {
                                        const popoverButton = document.querySelector('[commandfor="date-popover"]') as HTMLElement;
                                        popoverButton?.click();
                                    }
                                }}
                            >
                                Cancel{view}
                            </s-button>
                            <s-button variant="primary" onClick={() => console.log("Apply", value)}>
                                Apply
                            </s-button>
                        </s-stack>
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
}
