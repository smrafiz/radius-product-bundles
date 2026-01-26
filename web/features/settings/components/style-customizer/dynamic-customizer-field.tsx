"use client";

import { RefObject } from "react";
import { RtpbRangeSlider } from "@/shared";
import { CustomizerFieldConfig, CustomizerStyles, useCustomizer } from "@/features/settings";

/**
 * Universal customizer field renderer.
 *
 * Renders any field type from config and triggers form change for SaveBar.
 */
export function DynamicCustomizerField({
    config,
    formRef,
}: {
    config: CustomizerFieldConfig;
    formRef?: RefObject<HTMLFormElement | null>;
}) {
    const { styles, updateStyle } = useCustomizer();

    const value = styles[config.name];
    const defaultValue = (config as any).defaultValue;

    /**
     * Updates style and triggers form change for save bar.
     */
    const handleChange = (newValue: CustomizerStyles[typeof config.name]) => {
        updateStyle(config.name, newValue);
        formRef?.current?.dispatchEvent(new Event("input", { bubbles: true }));
    };

    switch (config.type) {
        case "color":
            return (
                <s-color-field
                    label={config.label}
                    name={config.name}
                    placeholder="Select a color"
                    value={String(value ?? defaultValue ?? "")}
                    onInput={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        handleChange(target.value as any);
                    }}
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
                        label={config.label}
                        labelAccessibilityVisibility="exclusive"
                        placeholder="0"
                        step={config.step ?? 1}
                        min={config.min}
                        max={config.max}
                        value={String(value ?? defaultValue ?? 0)}
                        onInput={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleChange(Number(target.value) as any);
                        }}
                    />
                </s-stack>
            );

        case "range":
            return (
                <s-stack gap="small-400">
                    <s-text>{config.label}</s-text>
                    <RtpbRangeSlider
                        values={Number(value ?? defaultValue ?? 0)}
                        maxValue={config.max ?? 100}
                        action={(val) => handleChange(val as any)}
                    />
                </s-stack>
            );

        case "buttonGroup":
            return (
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
                        label={config.label}
                        labelAccessibilityVisibility="exclusive"
                        value={String(value ?? defaultValue ?? "")}
                        onInput={(event: Event) => {
                            const target = event.target as HTMLSelectElement;
                            handleChange(target.value as any);
                        }}
                    >
                        {config.options.map((option) => (
                            <s-option key={String(option.value)} value={String(option.value)}>
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
