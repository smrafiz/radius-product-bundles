"use client";

import { RtpbRangeSlider } from "@/shared";
import { CustomizerFieldConfig, useCustomizerField } from "@/features/settings";

/**
 * Universal customizer field renderer.
 */
export function DynamicCustomizerField({
    config,
    onFieldChangeAction,
}: {
    config: CustomizerFieldConfig;
    onFieldChangeAction?: () => void;
}) {
    const { value, error, handleChange } = useCustomizerField(
        config,
        onFieldChangeAction,
    );

    const renderError = () =>
        error ? <s-text tone="critical">{error}</s-text> : null;

    switch (config.type) {
        case "color":
            return (
                <s-stack gap="small-200">
                    <s-color-field
                        label={config.label}
                        name={config.name}
                        placeholder="Select a color"
                        value={String(value ?? "")}
                        onInput={(e: Event) =>
                            handleChange(
                                (e.target as HTMLInputElement).value as any,
                            )
                        }
                    />
                    {renderError()}
                </s-stack>
            );

        case "number":
            return (
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-text>{config.label}</s-text>
                        <s-number-field
                            label={config.label}
                            labelAccessibilityVisibility="exclusive"
                            placeholder="0"
                            step={config.step ?? 1}
                            min={config.min}
                            max={config.max}
                            value={String(value ?? 0)}
                            onInput={(e: Event) =>
                                handleChange(
                                    Number(
                                        (e.target as HTMLInputElement).value,
                                    ) as any,
                                )
                            }
                        />
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        case "range":
            return (
                <s-stack gap="small-200">
                    <s-stack gap="small-400">
                        <s-text>{config.label}</s-text>
                        <RtpbRangeSlider
                            values={Number(value ?? 0)}
                            maxValue={config.max ?? 100}
                            action={(val) => handleChange(val as any)}
                        />
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
                        <s-button-group gap="none">
                            {config.options.map((option) => (
                                <s-button
                                    key={String(option.value)}
                                    slot="secondary-actions"
                                    variant={
                                        value === option.value
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleChange(option.value as any)
                                    }
                                >
                                    {option.label}
                                </s-button>
                            ))}
                        </s-button-group>
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        case "select":
            return (
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-text>{config.label}</s-text>
                        <s-select
                            label={config.label}
                            labelAccessibilityVisibility="exclusive"
                            value={String(value ?? "")}
                            onInput={(e: Event) =>
                                handleChange(
                                    (e.target as HTMLSelectElement)
                                        .value as any,
                                )
                            }
                        >
                            {config.options.map((option) => (
                                <s-option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </s-option>
                            ))}
                        </s-select>
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        default:
            return null;
    }
}
