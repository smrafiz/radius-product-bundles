"use client";

import { getGridClass, LabelField, LabelSectionConfig, SectionHeader } from "@/features/settings";

/**
 * Renders a labels section with nested label fields.
 */
export function LabelsSection({ config }: { config: LabelSectionConfig }) {
    const { id, title, tooltip, fields, columns = 1 } = config;
    const gridClass = getGridClass(columns);

    return (
        <s-section>
            <s-stack gap="base">
                <SectionHeader id={id} title={title} tooltip={tooltip} />
                <div className={gridClass}>
                    {fields.map((field) => (
                        <LabelField key={field.name} config={field} />
                    ))}
                </div>
            </s-stack>
        </s-section>
    );
}
