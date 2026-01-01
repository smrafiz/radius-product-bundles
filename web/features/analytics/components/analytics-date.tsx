"use client";

import React from "react";
import {
    DATE_PRESET_GROUPS,
    DATE_RANGE_PRESETS,
} from "@/features/analytics/constants";
import { useShopSettings } from "@/shared";
import { AnalyticsCalendar, useDateRangePicker } from "@/features/analytics";

/**
 * Analytics date range picker component
 */
export function AnalyticsDate() {
    const {
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
    } = useDateRangePicker();

    useShopSettings();

    return (
        <s-stack gap="base">
            <s-button
                commandFor="analytics-date-popover"
                variant="secondary"
                icon="calendar"
            >
                {label}
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
                            <s-stack gap="small-500" inlineSize="200px">
                                {DATE_PRESET_GROUPS.map((group, groupIndex) => (
                                    <React.Fragment key={groupIndex}>
                                        <s-box padding="small-300">
                                            <s-stack gap="small-400">
                                                {DATE_RANGE_PRESETS.slice(
                                                    group.start,
                                                    group.end,
                                                ).map((preset) => (
                                                    <s-clickable
                                                        key={preset.key}
                                                        padding="small-300"
                                                        borderRadius="base"
                                                        background={
                                                            activePreset ===
                                                            preset.key
                                                                ? "strong"
                                                                : "transparent"
                                                        }
                                                        onClick={() =>
                                                            handlePresetClick(
                                                                preset,
                                                            )
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
                                                                <s-text>
                                                                    ✓
                                                                </s-text>
                                                            )}
                                                        </s-stack>
                                                    </s-clickable>
                                                ))}
                                            </s-stack>
                                        </s-box>

                                        {groupIndex <
                                            DATE_PRESET_GROUPS.length - 1 && (
                                            <s-divider />
                                        )}
                                    </React.Fragment>
                                ))}
                            </s-stack>

                            {/* Vertical Divider */}
                            <div className="h-100">
                                <s-divider direction="block" />
                            </div>

                            {/* Custom Calendar */}
                            <AnalyticsCalendar
                                value={range}
                                onChange={handleCalendarChange}
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
                                command="--hide"
                                commandFor="analytics-date-popover"
                                onClick={handleCancel}
                            >
                                Cancel
                            </s-button>
                            <s-button
                                variant="primary"
                                command="--hide"
                                commandFor="analytics-date-popover"
                                onClick={(event) => handleApply(event)}
                                disabled={!isValidRange()}
                            >
                                Apply
                            </s-button>
                        </s-stack>
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
}
