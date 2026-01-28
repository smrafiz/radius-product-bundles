"use client";

import { RtpbRangeSlider } from "@/shared";
import { CustomizerFieldConfig, useCustomizerField } from "@/features/settings";

/**
 * Universal customizer field renderer.
 */
export function DynamicCustomizerField({
    config,
    onFieldChangeAction,
    resetKey = 0,
}: {
    config: CustomizerFieldConfig;
    onFieldChangeAction?: () => void;
    resetKey?: number;
}) {
    const { value, error, handleChange } = useCustomizerField(
        config,
        onFieldChangeAction,
    );

    const renderError = () =>
        error ? <s-text tone="critical">{error}</s-text> : null;

    // Use resetKey to force re-mount of web components after discard
    const fieldKey = `${config.name}-${resetKey}`;

    switch (config.type) {
        case "color":
            return (
                <s-color-field
                    key={fieldKey}
                    label={config.label}
                    name={config.name}
                    placeholder="Select a color"
                    value={String(value ?? "")}
                    error={error || undefined}
                    onInput={(e: Event) =>
                        handleChange(
                            (e.target as HTMLInputElement).value as any,
                        )
                    }
                />
            );

        case "number":
            return (
                <s-stack
                    direction="inline"
                    alignItems="center"
                    gap="small-300"
                    justifyContent="space-between"
                >
                    <s-text>{config.label}</s-text>
                    <s-number-field
                        key={fieldKey}
                        label={config.label}
                        labelAccessibilityVisibility="exclusive"
                        placeholder="0"
                        step={config.step ?? 1}
                        min={config.min}
                        max={config.max}
                        value={String(value ?? 0)}
                        error={error || undefined}
                        onInput={(e: Event) =>
                            handleChange(
                                Number(
                                    (e.target as HTMLInputElement).value,
                                ) as any,
                            )
                        }
                    />
                </s-stack>
            );

        case "range":
            return (
                <s-stack gap="small-200">
                    <s-stack gap="small-400">
                        <s-text>{config.label}</s-text>
                        <div
                            style={{
                                padding: "8px",
                                borderRadius: "4px",
                                border: error
                                    ? "2px solid var(--s-color-border-critical)"
                                    : "none",
                            }}
                        >
                            <RtpbRangeSlider
                                key={fieldKey}
                                values={Number(value ?? 0)}
                                maxValue={config.max ?? 100}
                                action={(val) => handleChange(val as any)}
                            />
                        </div>
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        case "buttonGroup":
            return (
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-text>{config.label}</s-text>
                        <div
                            style={{
                                borderRadius: "4px",
                                border: error
                                    ? "2px solid var(--s-color-border-critical)"
                                    : "none",
                            }}
                        >
                            <s-button-group gap="none">
                                {config.options.map((option) => (
                                    <s-button
                                        key={String(option.value)}
                                        slot="secondary-actions"
                                        tone={
                                            value === option.value
                                                ? "critical"
                                                : "neutral"
                                        }
                                        onClick={() =>
                                            handleChange(option.value as any)
                                        }
                                    >
                                        <span
                                            className={
                                                value === option.value
                                                    ? "opacity-100"
                                                    : "opacity-60"
                                            }
                                        >
                                            {option.label}
                                        </span>
                                    </s-button>
                                ))}
                            </s-button-group>
                        </div>
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        case "select":
            return (
                <s-stack
                    direction="inline"
                    alignItems="center"
                    gap="small-300"
                    justifyContent="space-between"
                >
                    <s-text>{config.label}</s-text>
                    <s-select
                        key={fieldKey}
                        label={config.label}
                        labelAccessibilityVisibility="exclusive"
                        value={String(value ?? "")}
                        error={error || undefined}
                        onInput={(e: Event) => {
                            const targetValue = (e.target as HTMLSelectElement)
                                .value;
                            const convertedValue = config.options.find(
                                (opt) => String(opt.value) === targetValue,
                            )?.value;
                            handleChange(convertedValue as any);
                        }}
                    >
                        {config.options.map((option) => (
                            <s-option
                                key={option.value}
                                value={String(option.value)}
                            >
                                {option.label}
                            </s-option>
                        ))}
                    </s-select>
                </s-stack>
            );

        default:
            return null;
    }
}
