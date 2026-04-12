"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { AppSettingsFormData, FieldConfig } from "@/features/settings";

/**
 * Renders a settings field based on its configuration.
 */
export function SettingsField({ config }: { config: FieldConfig }) {
    const {
        setValue,
        control,
        formState: { errors },
    } = useFormContext<AppSettingsFormData>();
    const value = useWatch({ control, name: config.name as keyof AppSettingsFormData });
    const error = (errors as any)[config.name]?.message as string | undefined;

    /**
     * Handles field value change
     */
    function handleChange(e: any) {
        const target = e.target as HTMLInputElement;
        let newValue: any;

        if (target.type === "checkbox") {
            newValue = target.checked;
        } else if (target.type === "number") {
            newValue = Number(target.value);
        } else {
            newValue = target.value;
        }

        setValue(config.name as any, newValue, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    // Get default value for fallback
    const defaultValue = (config as any).defaultValue;

    switch (config.type) {
        case "text":
            return (
                <s-text-field
                    name={config.name}
                    label={config.label}
                    value={String(value ?? defaultValue ?? "")}
                    onChange={handleChange}
                    placeholder={config.placeholder}
                    details={config.details}
                    error={error}
                />
            );

        case "textarea":
            return (
                <s-text-area
                    name={config.name}
                    label={config.label}
                    value={String(value ?? defaultValue ?? "")}
                    onChange={handleChange}
                    placeholder={config.placeholder}
                    details={config.details}
                    rows={config.rows ?? 4}
                    error={error}
                />
            );

        case "number":
            return (
                <s-number-field
                    name={config.name}
                    label={config.label}
                    value={String(value ?? defaultValue ?? 0)}
                    onChange={handleChange}
                    min={config.min}
                    max={config.max}
                    details={config.details}
                    readOnly={config.readOnly}
                    error={error}
                />
            );

        case "select":
            return (
                <s-select
                    name={config.name}
                    label={config.label}
                    value={String(value ?? defaultValue ?? "")}
                    onChange={handleChange}
                    details={config.details}
                    error={error}
                >
                    {config.options.map((option) => (
                        <s-option key={option.value} value={option.value}>
                            {option.label}
                        </s-option>
                    ))}
                </s-select>
            );

        case "switch":
            return (
                <s-switch
                    name={config.name}
                    label={config.label}
                    details={config.details}
                    checked={Boolean(value ?? defaultValue ?? false)}
                    onChange={handleChange}
                />
            );

        default:
            return null;
    }
}
