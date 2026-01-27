"use client";

import {
    CustomizerSectionConfig,
    DynamicCustomizerField,
    getGridClass,
    groupFieldsByType,
    useCustomizerSection,
} from "@/features/settings";

/**
 * Collapsible customizer section renderer.
 */
export function DynamicCustomizerSection({
    config,
    onFieldChangeAction,
}: {
    config: CustomizerSectionConfig;
    onFieldChangeAction?: () => void;
}) {
    const { isOpen, toggle } = useCustomizerSection(config);
    const { title, fields, columns = 1 } = config;

    const fieldGroups = groupFieldsByType(fields);

    return (
        <s-stack>
            <div
                className={`cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${isOpen ? "bg-[#f7f7f7]" : ""}`}
                onClick={toggle}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={isOpen}
                >
                    <s-heading>{title}</s-heading>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
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
                                        onFieldChangeAction={onFieldChangeAction}
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
                                        onFieldChangeAction={onFieldChangeAction}
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
