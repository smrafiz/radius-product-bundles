"use client";

import { DynamicField, getGridClass, SectionConfig } from "@/features/settings";

/**
 * Universal section renderer - renders ANY section from config.
 */
export function DynamicSection({
    config,
    parentPath,
}: {
    config: SectionConfig;
    parentPath?: string;
}) {
    const { id, title, tooltip, fields, columns = 1 } = config;

    const switchFields = fields.filter((f) => f.type === "switch");
    const gridFields = fields.filter(
        (f) => f.type !== "switch" && !f.fullWidth,
    );
    const fullWidthFields = fields.filter(
        (f) => f.type !== "switch" && f.fullWidth,
    );
    const gridClass = getGridClass(columns);

    const tooltipId = `${id}-tooltip`;

    return (
        <s-section>
            <s-stack gap="base">
                {/* Section Header */}
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>{title}</s-heading>
                    {tooltip && (
                        <>
                            <s-tooltip id={tooltipId}>
                                <s-text>{tooltip}</s-text>
                            </s-tooltip>
                            <s-icon
                                tone="neutral"
                                type="info"
                                interestFor={tooltipId}
                            />
                        </>
                    )}
                </s-stack>

                {/* Grid Fields (text, number, select, textarea) */}
                {gridFields.length > 0 && (
                    <div className={gridClass}>
                        {gridFields.map((field) => (
                            <DynamicField
                                key={String(field.name)}
                                config={field}
                                parentPath={parentPath}
                            />
                        ))}
                    </div>
                )}

                {/* Full-Width Fields (break out of grid) */}
                {fullWidthFields.map((field) => (
                    <DynamicField
                        key={String(field.name)}
                        config={field}
                        parentPath={parentPath}
                    />
                ))}

                {/* Switch Fields (stacked) */}
                {switchFields.length > 0 && (
                    <s-stack gap="base">
                        {switchFields.map((field) => (
                            <DynamicField
                                key={String(field.name)}
                                config={field}
                                parentPath={parentPath}
                            />
                        ))}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
