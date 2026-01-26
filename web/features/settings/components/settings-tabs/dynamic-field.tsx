"use client";

import { triggerSaveBar } from "@/shared";
import { useFormContext } from "react-hook-form";
import { AppSettingsFormData, FieldConfig } from "@/features/settings";

/** Form ID for settings - must match GlobalForm formId */
const SETTINGS_FORM_ID = "settings";

/**
 * Universal field renderer - renders any field type from config.
 *
 * Automatically triggers SaveBar when field values change.
 */
export function DynamicField({
    config,
    parentPath,
}: {
    config: FieldConfig;
    parentPath?: string;
}) {
    const {
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<AppSettingsFormData>();

    const fieldPath = parentPath ? `${parentPath}.${config.name}` : config.name;
    const value = watch(fieldPath as any);
    const error = getNestedError(errors, fieldPath);
    const defaultValue = (config as any).defaultValue;

    /**
     * Handles field value change and triggers SaveBar.
     */
    function handleChange(e: any) {
        const target = e.target as HTMLInputElement;
        let newValue: any;

        if (config.type === "switch") {
            newValue = target?.checked;
        } else if (config.type === "number") {
            newValue = target.value === "" ? 0 : Number(target.value);
        } else {
            newValue = target.value;
        }

        setValue(fieldPath as any, newValue, {
            shouldDirty: true,
            shouldValidate: true,
        });

        // Trigger SaveBar to show
        triggerSaveBar(SETTINGS_FORM_ID);
    }

    switch (config.type) {
        case "text":
            return (
                <s-text-field
                    name={fieldPath}
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
                    name={fieldPath}
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
                    name={fieldPath}
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
                    name={fieldPath}
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
                    name={fieldPath}
                    label={config.label}
                    details={config.details}
                    checked={Boolean(value ?? defaultValue ?? false)}
                    onInput={handleChange}
                />
            );

        case "custom":
            // Custom components are rendered by the section/tab level
            return null;

        default:
            return null;
    }
}

/**
 * Gets nested error message from errors object.
 */
function getNestedError(errors: any, path: string): string | undefined {
    const parts = path.split(".");
    let current = errors;

    for (const part of parts) {
        if (!current || typeof current !== "object") {
            return undefined;
        }
        current = current[part];
    }

    return current?.message as string | undefined;
}
