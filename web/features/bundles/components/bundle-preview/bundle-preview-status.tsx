"use client";
import { useState } from "react";
import { formatDateLong } from "@/shared";
import { BUNDLE_STATUSES } from "@/features/bundles";

export function BundlePreviewStatus() {
    const [status, setStatus] = useState<keyof typeof BUNDLE_STATUSES>("DRAFT");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleDateChange = (value: string) => {
        if (!value || !value.includes("--")) {
            setStartDate("");
            setEndDate("");
            return;
        }

        const [start, end] = value.split("--");

        setStartDate(start || "");
        setEndDate(end || "");
    };

    return (
        <s-section>
            <s-heading>Bundle status</s-heading>

            <s-select
                label="Bundle status"
                value={status}
                onChange={(e) => {
                    const target = e.target as HTMLSelectElement;
                    setStatus(target.value as keyof typeof BUNDLE_STATUSES);
                }}
                labelAccessibilityVisibility="exclusive"
            >
                {Object.entries(BUNDLE_STATUSES).map(([key, { text }]) => (
                    <s-option key={key} value={key}>
                        {text}
                    </s-option>
                ))}
            </s-select>

            {status === "SCHEDULED" && (
                <s-stack gap="base">
                    <s-button commandFor="date-popover">
                        {startDate && endDate ? (
                            <s-stack direction="inline" alignItems="center" gap="small">
                                {formatDateLong(startDate)}
                                <s-icon type="arrow-right" />
                                {formatDateLong(endDate)}
                            </s-stack>
                        ) : (
                            "Set date"
                        )}
                    </s-button>

                    <s-popover id="date-popover">
                        <s-stack gap="base" direction="inline">
                            <s-date-picker
                                type="range"
                                value={
                                    startDate && endDate
                                        ? `${startDate}--${endDate}`
                                        : ""
                                }
                                onChange={(e: any) =>
                                    handleDateChange(
                                        e.value ??
                                        e.currentTarget?.value ??
                                        ""
                                    )
                                }
                            />
                        </s-stack>
                    </s-popover>
                </s-stack>
            )}
        </s-section>
    );
}
