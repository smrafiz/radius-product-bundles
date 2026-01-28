"use client";

import { useFormContext } from "react-hook-form";
import {
    CustomizerSectionConfig,
    CustomizerStyles,
    DynamicCustomizerField,
    getGridClass,
    groupFieldsByType,
} from "@/features/settings";

/**
 * Collapsible customizer section renderer.
 */
export function DynamicCustomizerSection({
    config,
    isOpen,
    onToggleAction,
    onFieldChangeAction,
}: {
    config: CustomizerSectionConfig;
    isOpen: boolean;
    onToggleAction: () => void;
    onFieldChangeAction?: () => void;
}) {
    const { title, fields, columns = 1 } = config;
    const { formState: { errors } } = useFormContext<CustomizerStyles>();

    const fieldGroups = groupFieldsByType(fields);
    const hasError = fields.some(field => errors[field.name]);

    return (
        <s-stack>
            <div
                className={`cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${isOpen ? "bg-[#f7f7f7]" : ""}`}
                onClick={onToggleAction}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={isOpen}
                >
                    <s-stack direction="inline" alignItems="center" gap="small">
                        <s-heading>
                            <s-text tone={hasError ? "critical" : "auto"}>{title}</s-text>
                        </s-heading>
                        {hasError && (
                            <s-icon
                                type="alert-octagon-filled"
                                tone="critical"
                            />
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
                    {fieldGroups.map((group) =>
                        group.isRange ? (
                            <s-stack gap="base" key={group.id}>
                                {group.fields.map((field) => (
                                    <DynamicCustomizerField
                                        key={field.name}
                                        config={field}
                                        onFieldChangeAction={
                                            onFieldChangeAction
                                        }
                                    />
                                ))}
                            </s-stack>
                        ) : (
                            <div
                                className={getGridClass(columns)}
                                key={group.id}
                            >
                                {group.fields.map((field) => (
                                    <DynamicCustomizerField
                                        key={field.name}
                                        config={field}
                                        onFieldChangeAction={
                                            onFieldChangeAction
                                        }
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
