"use client";

import React from "react";
import {
    DATE_PRESET_GROUPS,
    DATE_RANGE_PRESETS,
} from "@/features/analytics/constants";
import { ProBadge, useCrossSellStore, usePlan, useShopSettings } from "@/shared";
import { AnalyticsCalendar, useDateRangePicker } from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Analytics date range picker component
 */
export function AnalyticsDate() {
    const t = useTranslations("Analytics.DatePicker");
    const tp = useTranslations("Analytics.DatePresets");
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
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const canFullAnalytics = canUse("analytics_full");
    const FREE_PRESETS = new Set(["today", "yesterday", "last7", "last30"]);

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
                                                ).map((preset) => {
                                                    const isLocked = !canFullAnalytics && !FREE_PRESETS.has(preset.key);
                                                    return (
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
                                                                isLocked
                                                                    ? openCrossSell(tp(preset.key, undefined, preset.label))
                                                                    : handlePresetClick(preset)
                                                            }
                                                        >
                                                            <s-stack
                                                                direction="inline"
                                                                justifyContent="space-between"
                                                                alignItems="center"
                                                            >
                                                                <span className={isLocked ? "opacity-50" : undefined}>
                                                                    <s-text
                                                                        type={
                                                                            activePreset ===
                                                                            preset.key
                                                                                ? "strong"
                                                                                : "generic"
                                                                        }
                                                                    >
                                                                        {tp(
                                                                            preset.key,
                                                                            undefined,
                                                                            preset.label,
                                                                        )}
                                                                    </s-text>
                                                                </span>
                                                                {isLocked ? (
                                                                    <ProBadge label={tp(preset.key, undefined, preset.label)} />
                                                                ) : activePreset === preset.key ? (
                                                                    <s-text>✓</s-text>
                                                                ) : null}
                                                            </s-stack>
                                                        </s-clickable>
                                                    );
                                                })}
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
                            {canFullAnalytics ? (
                                <AnalyticsCalendar
                                    value={range}
                                    onChange={handleCalendarChange}
                                    onStartInputChange={handleStartInputChange}
                                    onEndInputChange={handleEndInputChange}
                                    startInput={startInput}
                                    endInput={endInput}
                                />
                            ) : (
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => openCrossSell("Custom Date Range")}
                                >
                                    <div className="pointer-events-none opacity-30">
                                        <AnalyticsCalendar
                                            value={range}
                                            onChange={() => {}}
                                            onStartInputChange={() => {}}
                                            onEndInputChange={() => {}}
                                            startInput={startInput}
                                            endInput={endInput}
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md">
                                            <s-icon type="lock" tone="neutral" />
                                        </span>
                                    </div>
                                </div>
                            )}
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
                                {t("cancel")}
                            </s-button>
                            <s-button
                                variant="primary"
                                command="--hide"
                                commandFor="analytics-date-popover"
                                onClick={(event) => handleApply(event)}
                                disabled={!isValidRange()}
                            >
                                {t("apply")}
                            </s-button>
                        </s-stack>
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
}
