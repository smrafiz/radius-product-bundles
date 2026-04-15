"use client";

import { ProBadge, triggerSaveBar, useCrossSellStore, usePlan } from "@/shared";
import { useFormContext, useWatch } from "react-hook-form";
import { AppSettingsFormData, FieldConfig } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

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
    tabId,
}: {
    config: FieldConfig;
    parentPath?: string;
    tabId: string;
}) {
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const isLocked = config.proFeature && !canUse(config.proFeature as any);

    if (isLocked) {
        return (
            <div
                className="relative cursor-pointer"
                onClick={() => openCrossSell(config.label)}
            >
                <div className="pointer-events-none opacity-50">
                    <DynamicFieldInner
                        config={config}
                        parentPath={parentPath}
                        tabId={tabId}
                    />
                </div>
                <span className="absolute top-0 right-0 z-10">
                    <ProBadge label={config.label} />
                </span>
            </div>
        );
    }

    return (
        <DynamicFieldInner
            config={config}
            parentPath={parentPath}
            tabId={tabId}
        />
    );
}

function DynamicFieldInner({
    config,
    parentPath,
    tabId,
}: {
    config: FieldConfig;
    parentPath?: string;
    tabId: string;
}) {
    const {
        setValue,
        control,
        formState: { errors },
    } = useFormContext<AppSettingsFormData>();

    const fieldPath = parentPath ? `${parentPath}.${config.name}` : config.name;
    const value = useWatch({ control, name: fieldPath as any });
    const error = getNestedError(errors, fieldPath);
    const defaultValue = (config as any).defaultValue;
    const t = useTranslations("Settings.Tabs");

    const tabKey = parentPath || tabId || "global";
    const fieldI18nKey = `${tabKey}.Fields.${config.name}`;

    const label = t(`${fieldI18nKey}.label`, undefined, config.label);
    const details = config.details
        ? t(`${fieldI18nKey}.details`, undefined, config.details)
        : undefined;
    const placeholder = config.placeholder
        ? t(`${fieldI18nKey}.placeholder`, undefined, config.placeholder)
        : undefined;

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
                    label={label}
                    value={String(value ?? defaultValue ?? "")}
                    onInput={handleChange}
                    placeholder={placeholder}
                    details={details}
                    error={error}
                    maxLength={config.validation?.maxLength?.value}
                />
            );

        case "textarea":
            return (
                <s-text-area
                    name={fieldPath}
                    label={label}
                    value={String(value ?? defaultValue ?? "")}
                    onInput={handleChange}
                    placeholder={placeholder}
                    details={details}
                    rows={config.rows ?? 4}
                    error={error}
                />
            );

        case "number":
            return (
                <s-number-field
                    name={fieldPath}
                    label={label}
                    value={String(value ?? defaultValue ?? 0)}
                    onInput={handleChange}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    details={details}
                    readOnly={config.readOnly}
                    error={error}
                />
            );

        case "select":
            return (
                <s-select
                    name={fieldPath}
                    label={label}
                    value={String(value ?? defaultValue ?? "")}
                    onChange={handleChange}
                    details={details}
                    error={error}
                >
                    {config.options.map((option) => (
                        <s-option key={option.value} value={option.value}>
                            {t(
                                `${fieldI18nKey}.options.${option.value}`,
                                undefined,
                                option.label,
                            )}
                        </s-option>
                    ))}
                </s-select>
            );

        case "switch":
            return (
                <s-switch
                    name={fieldPath}
                    label={label}
                    details={details}
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
