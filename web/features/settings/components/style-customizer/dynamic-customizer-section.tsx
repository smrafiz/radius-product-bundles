"use client";

import { ReactElement, RefObject, useState } from "react";
import { CustomizerSectionConfig, DynamicCustomizerField, } from "@/features/settings";

/**
 * Collapsible customizer section renderer.
 *
 * Renders all fields within a section based on config order.
 */
export function DynamicCustomizerSection({
    config,
    formRef,
}: {
    config: CustomizerSectionConfig;
    formRef?: RefObject<HTMLFormElement | null>;
}) {
    const [open, setOpen] = useState(config.defaultOpen ?? false);

    const { title, fields, columns = 1 } = config;

    /**
     * Gets grid class based on column count.
     */
    const getGridClass = (cols: number): string => {
        switch (cols) {
            case 2:
                return "grid grid-cols-2 gap-4";
            case 3:
                return "grid grid-cols-3 gap-4";
            default:
                return "flex flex-col gap-4";
        }
    };

    /**
     * Groups consecutive fields by their render type.
     * Range fields are rendered full-width, others respect grid columns.
     */
    const renderFields = () => {
        const elements: ReactElement[] = [];
        let currentGroup: typeof fields = [];
        let currentIsRange = false;

        const flushGroup = () => {
            if (currentGroup.length === 0) return;

            if (currentIsRange) {
                // Range fields render full-width stacked
                elements.push(
                    <s-stack gap="base" key={`range-${elements.length}`}>
                        {currentGroup.map((field) => (
                            <DynamicCustomizerField
                                key={field.name}
                                config={field}
                                formRef={formRef}
                            />
                        ))}
                    </s-stack>,
                );
            } else {
                // Other fields render in grid
                elements.push(
                    <div
                        className={getGridClass(columns)}
                        key={`grid-${elements.length}`}
                    >
                        {currentGroup.map((field) => (
                            <DynamicCustomizerField
                                key={field.name}
                                config={field}
                                formRef={formRef}
                            />
                        ))}
                    </div>,
                );
            }

            currentGroup = [];
        };

        fields.forEach((field) => {
            const isRange = field.type === "range";

            if (currentGroup.length === 0) {
                // Start new group
                currentIsRange = isRange;
                currentGroup.push(field);
            } else if (isRange === currentIsRange) {
                // Same type, add to current group
                currentGroup.push(field);
            } else {
                // Different type, flush current group and start new
                flushGroup();
                currentIsRange = isRange;
                currentGroup.push(field);
            }
        });

        // Flush remaining group
        flushGroup();

        return elements;
    };

    return (
        <s-stack>
            {/* Section Header (Collapsible) */}
            <div
                className={`cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${open ? "bg-[#f7f7f7]" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={open}
                >
                    <s-heading>{title}</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            {/* Section Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
                `}
            >
                <s-stack gap="base" padding="base">
                    {renderFields()}
                </s-stack>
            </div>
        </s-stack>
    );
}
