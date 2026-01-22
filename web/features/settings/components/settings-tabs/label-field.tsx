"use client";

import { useFormContext } from "react-hook-form";
import { AppSettingsFormData, DEFAULT_LABELS, LabelFieldConfig, LabelsSettingsFormData, } from "@/features/settings";

/**
 * Renders a label field.
 */
export function LabelField({ config }: { config: LabelFieldConfig }) {
    const { setValue, watch } = useFormContext<AppSettingsFormData>();
    const labels: LabelsSettingsFormData =
        (watch("labels") as LabelsSettingsFormData) || DEFAULT_LABELS;

    /**
     * Handles label field value change
     */
    function handleChange(e: any) {
        const target = e.target as HTMLInputElement;
        setValue(
            "labels",
            { ...labels, [config.name]: target.value },
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
    }

    return (
        <s-text-field
            name={`labels.${config.name}`}
            label={config.label}
            value={(labels as any)[config.name] ?? config.defaultValue ?? ""}
            onChange={handleChange}
            placeholder={config.placeholder}
            details={config.details}
        />
    );
}
