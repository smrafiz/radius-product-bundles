"use client";
import React, { useState, useEffect } from "react";

export function AnalyticsDate() {
    const [value, setValue] = useState("2025-01-01--2025-01-31");
    const [label, setLabel] = useState("This month");

    useEffect(() => {
        if (value === "2025-01-07--2025-01-13") {
            setLabel("Last 7 days");
        } else if (value === "2024-12-14--2025-01-13") {
            setLabel("Last 30 days");
        } else if (value === "2025-01-01--2025-01-31") {
            setLabel("This month");
        } else {
            const [start, end] = value.split("--");
            setLabel(`${start} → ${end}`);
        }
    }, [value]);

    const last7Days = () => setValue("2025-01-07--2025-01-13");
    const last30Days = () => setValue("2024-12-14--2025-01-13");
    const thisMonth = () => setValue("2025-01-01--2025-01-31");

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
                    <s-button-group>
                        <s-button slot="secondary-actions" onClick={last7Days}>
                            Last 7 days
                        </s-button>
                        <s-button slot="secondary-actions" onClick={last30Days}>
                            Last 30 days
                        </s-button>
                        <s-button slot="secondary-actions" onClick={thisMonth}>
                            This month
                        </s-button>
                    </s-button-group>
                    <s-date-picker
                        type="range"
                        name="analytics-period"
                        id="analytics-picker"
                        view="2025-01"
                        value={value}
                        onChange={(event) => {
                            console.log(
                                "Date range changed:",
                                event.currentTarget.value,
                            );
                            setValue(event.currentTarget.value);
                        }}
                    />
                    <s-text>Selected range: {value}</s-text>
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
}
