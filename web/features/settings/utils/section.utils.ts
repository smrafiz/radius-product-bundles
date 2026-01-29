import { CustomizerFieldConfig, FieldGroup } from "@/features/settings";

/**
 * Gets grid class based on column count.
 */
export function getGridClass(columns: number): string {
    switch (columns) {
        case 2:
            return "grid grid-cols-1 md:grid-cols-2 gap-4";
        case 3:
            return "grid grid-cols-1 md:grid-cols-3 gap-4";
        default:
            return "grid grid-cols-1 gap-4";
    }
}

/**
 * Groups consecutive fields by their render type.
 *
 * Range fields are rendered full-width, others respect grid columns.
 */
export function groupFieldsByType(
    fields: CustomizerFieldConfig[],
): FieldGroup[] {
    const groups: FieldGroup[] = [];
    let currentGroup: CustomizerFieldConfig[] = [];
    let currentIsFullWidth = false;
    let groupIndex = 0;

    /** Fields that should render full-width */
    const fullWidthTypes = ["range", "preset", "heading", "divider"];

    const flushGroup = () => {
        if (currentGroup.length === 0) return;

        groups.push({
            id: `group-${groupIndex++}`,
            isRange: currentIsFullWidth, // Keep as isRange for backward compatibility
            fields: [...currentGroup],
        });

        currentGroup = [];
    };

    fields.forEach((field) => {
        const isFullWidth = fullWidthTypes.includes(field.type);

        if (currentGroup.length === 0) {
            currentIsFullWidth = isFullWidth;
            currentGroup.push(field);
        } else if (isFullWidth === currentIsFullWidth) {
            currentGroup.push(field);
        } else {
            flushGroup();
            currentIsFullWidth = isFullWidth;
            currentGroup.push(field);
        }
    });

    flushGroup();

    return groups;
}
