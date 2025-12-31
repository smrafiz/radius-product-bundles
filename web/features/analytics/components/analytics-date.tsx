"use client";

import React, { useState } from "react";
import { DATE_RANGE_PRESETS } from "@/features/analytics/constants";
import { AnalyticsCalendar, useDateRangePicker } from "@/features/analytics";

/**
 * Analytics date range picker component
 *
 * Provides date range selection with presets and custom calendar.
 */
export function AnalyticsDate() {
    const [isOpen, setIsOpen] = useState(false);

    const {
        range,
        startInput,
        endInput,
        label,
        activePreset,
        setRange,
        handleStartInputChange,
        handleEndInputChange,
        handlePresetClick,
        applyRange,
        resetRange,
    } = useDateRangePicker();

    /**
     * Handle Apply button
     */
    const handleApply = () => {
        applyRange();
        setIsOpen(false);
    };

    /**
     * Handle Cancel button
     */
    const handleCancel = () => {
        resetRange();
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
                <s-box padding="none">
                    <s-stack gap="none">
                        {/* Presets + Calendar */}
                        <s-stack
                            direction="inline"
                            gap="none"
                            alignItems="start"
                        >
                            {/* Preset Buttons */}
                            <s-box padding="small-300">
                                <s-stack gap="small-400" inlineSize="197px">
                                    {DATE_RANGE_PRESETS.map((preset) => (
                                        <s-clickable
                                            key={preset.key}
                                            padding="small-300"
                                            borderRadius="base"
                                            background={
                                                activePreset === preset.key
                                                    ? "strong"
                                                    : "transparent"
                                            }
                                            onClick={() =>
                                                handlePresetClick(preset)
                                            }
                                        >
                                            <s-stack
                                                direction="inline"
                                                justifyContent="space-between"
                                            >
                                                <s-text
                                                    type={
                                                        activePreset ===
                                                        preset.key
                                                            ? "strong"
                                                            : "generic"
                                                    }
                                                >
                                                    {preset.label}
                                                </s-text>
                                                {activePreset ===
                                                    preset.key && (
                                                    <s-text>✓</s-text>
                                                )}
                                            </s-stack>
                                        </s-clickable>
                                    ))}
                                </s-stack>
                            </s-box>

                            {/* Vertical Divider */}
                            <div
                                style={{
                                    width: "1px",
                                    background:
                                        "var(--p-color-border-subdued, #e1e3e5)",
                                    alignSelf: "stretch",
                                }}
                            />

                            {/* Custom Calendar with Inputs */}
                            <AnalyticsCalendar
                                value={range}
                                onChange={(newRange) => {
                                    setRange(newRange);
                                }}
                                onStartInputChange={handleStartInputChange}
                                onEndInputChange={handleEndInputChange}
                                startInput={startInput}
                                endInput={endInput}
                            />
                        </s-stack>

                        <s-divider direction="inline" />

                        {/* Action Buttons */}
                        <s-stack
                            direction="inline"
                            justifyContent="end"
                            gap="small-200"
                            padding="small"
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
