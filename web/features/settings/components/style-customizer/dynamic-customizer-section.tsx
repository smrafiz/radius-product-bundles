"use client";

import { useFormContext } from "react-hook-form";
import {
    ConditionContext,
    CustomizerSectionConfig,
    CustomizerStyles,
    DynamicCustomizerField,
    getGridClass,
    getVisibleFields,
    groupFieldsByType,
    isSectionVisible,
} from "@/features/settings";

interface DynamicCustomizerSectionProps {
    config: CustomizerSectionConfig;
    context: ConditionContext;
    isOpen: boolean;
    onToggleAction: () => void;
    onFieldChangeAction?: () => void;
    resetKey?: number;
}

/**
 * Collapsible customizer section renderer with conditional visibility.
 */
export function DynamicCustomizerSection({
    config,
    context,
    isOpen,
    onToggleAction,
    onFieldChangeAction,
    resetKey = 0,
}: DynamicCustomizerSectionProps) {
    const { title, description, fields, columns = 1 } = config;
    const {
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    // Check if section should be visible
    if (!isSectionVisible(config, context)) {
        return null;
    }

    // Filter visible fields based on conditions
    const visibleFields = getVisibleFields(fields, context);

    // Don't render section if no visible fields
    if (visibleFields.length === 0) {
        return null;
    }

    const fieldGroups = groupFieldsByType(visibleFields);
    const hasError = visibleFields.some(
        (
            field,
        ): field is Extract<typeof field, { name: keyof CustomizerStyles }> =>
            "name" in field &&
            true &&
            !!errors[field.name as keyof CustomizerStyles],
    );

    return (
        <s-stack>
            <div
                className={`cursor-pointer z-3 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${isOpen ? "bg-[#f7f7f7]" : ""}`}
                onClick={onToggleAction}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={isOpen}
                >
                    <s-stack gap="none">
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small"
                        >
                            <s-heading>
                                <s-text tone={hasError ? "critical" : "auto"}>
                                    {title}
                                </s-text>
                            </s-heading>
                            {hasError && (
                                <s-icon
                                    type="alert-octagon-filled"
                                    tone="critical"
                                />
                            )}
                        </s-stack>
                        {description && isOpen && (
                            <s-text tone="neutral">
                                <span className="text-[0.75rem] text-[#616161]">
                                    {description}
                                </span>
                            </s-text>
                        )}
                    </s-stack>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "max-h-500 opacity-100 border-b border-[#e3e3e3]"
                        : "max-h-0 opacity-0"
                }`}
            >
                <s-stack gap="base" padding="base">
                    {/* Fields grouped by type */}
                    {fieldGroups.map((group) =>
                        group.isRange ? (
                            <s-stack gap="base" key={group.id}>
                                {group.fields.map((field, index) => (
                                    <DynamicCustomizerField
                                        key={`${group.id}-${"name" in field ? field.name : `${field.type}-${index}`}`}
                                        config={field}
                                        context={context}
                                        onFieldChangeAction={
                                            onFieldChangeAction
                                        }
                                        resetKey={resetKey}
                                    />
                                ))}
                            </s-stack>
                        ) : (
                            <div
                                className={getGridClass(columns)}
                                key={group.id}
                            >
                                {group.fields.map((field, index) => (
                                    <DynamicCustomizerField
                                        key={`${group.id}-${"name" in field ? field.name : `${field.type}-${index}`}`}
                                        config={field}
                                        context={context}
                                        onFieldChangeAction={
                                            onFieldChangeAction
                                        }
                                        resetKey={resetKey}
                                    />
                                ))}
                            </div>
                        ),
                    )}
                </s-stack>
            </div>
        </s-stack>
    );
}
