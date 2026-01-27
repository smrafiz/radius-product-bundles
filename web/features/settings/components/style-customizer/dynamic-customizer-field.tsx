"use client";

import { useFormContext } from "react-hook-form";
import { RtpbRangeSlider } from "@/shared";
import {
    CustomizerFieldConfig,
    CustomizerStyles,
    useCustomizer,
} from "@/features/settings";

interface DynamicCustomizerFieldProps {
    config: CustomizerFieldConfig;
    onFieldChange?: () => void;
}

/**
 * Universal customizer field renderer with RHF integration.
 *
 * Uses React Hook Form for validation and Zustand for live preview.
 * Triggers onFieldChange callback to update SaveBar dirty state.
 */
export function DynamicCustomizerField({
    config,
    onFieldChange,
}: DynamicCustomizerFieldProps) {
    // Zustand store for live preview
    const { styles, updateStyle } = useCustomizer();

    // RHF for validation
    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const value = styles[config.name];
    const defaultValue = (config as any).defaultValue;
    const fieldError = errors[config.name];

    /**
     * Updates both RHF (validation) and Zustand (preview).
     * Triggers onFieldChange callback for SaveBar.
     */
    const handleChange = (newValue: CustomizerStyles[typeof config.name]) => {
        // Update RHF for validation
        setValue(config.name, newValue, {
            shouldDirty: true,
            shouldValidate: true,
        });

        // Update Zustand for live preview
        updateStyle(config.name, newValue);

        // Trigger SaveBar dirty state
        onFieldChange?.();
    };

    /**
     * Renders field error message if present.
     */
    const renderError = () => {
        if (!fieldError) return null;
        return (
            <s-text tone="critical">
                {fieldError.message as string}
            </s-text>
        );
    };

    switch (config.type) {
        case "color":
            return (
                <s-stack gap="small-200">
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
                            value={String(value ?? defaultValue ?? 0)}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleChange(Number(target.value) as any);
                            }}
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
                            values={Number(value ?? defaultValue ?? 0)}
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
                            value={String(value ?? defaultValue ?? "")}
                            onInput={(event: Event) => {
                                const target =
                                    event.target as HTMLSelectElement;
                                handleChange(target.value as any);
                            }}
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
