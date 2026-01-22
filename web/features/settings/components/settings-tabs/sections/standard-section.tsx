"use client";

import { getGridClass, SectionConfig, SectionHeader, SettingsField } from "@/features/settings";

/**
 * Renders a standard settings section with fields.
 */
export function StandardSection({ config }: { config: SectionConfig }) {
    const { id, title, tooltip, fields, columns = 1 } = config;

    const switchFields = fields.filter((f) => f.type === "switch");
    const otherFields = fields.filter((f) => f.type !== "switch");
    const gridClass = getGridClass(columns);

    return (
        <s-section>
            <s-stack gap="base">
                <SectionHeader id={id} title={title} tooltip={tooltip} />

                {otherFields.length > 0 && (
                    <div className={gridClass}>
                        {otherFields.map((field) => (
                            <SettingsField
                                key={String(field.name)}
                                config={field}
                            />
                        ))}
                    </div>
                )}

                {switchFields.length > 0 && (
                    <s-stack gap="base">
                        {switchFields.map((field) => (
                            <SettingsField
                                key={String(field.name)}
                                config={field}
                            />
                        ))}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
