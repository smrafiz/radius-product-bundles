import {
    ConditionContext,
    CustomizerFieldConfig,
    CustomizerSectionConfig,
    CustomizerStyles,
    FieldCondition,
    PreviewTemplateId,
} from "@/features/settings";
import { WidgetLayout } from "@/prisma/generated/enums";

/**
 * Gets the value to check for a condition field.
 * Supports special fields like _layout and _bundleType.
 */
function getConditionValue(
    field: FieldCondition["field"],
    context: ConditionContext,
): unknown {
    if (field === "_layout") {
        return context.activeLayout;
    }
    if (field === "_bundleType") {
        return context.activeBundleType;
    }

    // Resolve value with responsive overrides
    const key = field as keyof CustomizerStyles;
    let value = context.styles[key];

    if (context.activeDevice !== "desktop") {
        const override = context.styles[context.activeDevice]?.[key];
        if (override !== undefined) {
            value = override as any;
        }
    }

    return value;
}

/**
 * Evaluates a single condition against the context.
 */
export function evaluateCondition(
    condition: FieldCondition,
    context: ConditionContext,
): boolean {
    const fieldValue = getConditionValue(condition.field, context);
    const { operator, value } = condition;

    switch (operator) {
        case "equals":
            return fieldValue === value;

        case "notEquals":
            return fieldValue !== value;

        case "in":
            // Value should be an array, check if fieldValue is in it
            if (Array.isArray(value)) {
                return value.includes(fieldValue as string | number | boolean);
            }
            return fieldValue === value;

        case "notIn":
            // Value should be an array, check if fieldValue is NOT in it
            if (Array.isArray(value)) {
                return !value.includes(fieldValue as string | number | boolean);
            }
            return fieldValue !== value;

        default:
            return true;
    }
}

/**
 * Evaluates all conditions (AND logic).
 */
export function evaluateConditions(
    conditions: FieldCondition | FieldCondition[] | undefined,
    context: ConditionContext,
): boolean {
    if (!conditions) return true;

    const conditionArray = Array.isArray(conditions)
        ? conditions
        : [conditions];

    return conditionArray.every((condition) =>
        evaluateCondition(condition, context),
    );
}

/**
 * Checks if a field should be visible based on all conditions.
 */
export function isFieldVisible(
    field: CustomizerFieldConfig,
    context: ConditionContext,
): boolean {
    // Check layout restriction (shorthand)
    if (field.layouts && field.layouts.length > 0) {
        if (!field.layouts.includes(context.activeLayout)) {
            return false;
        }
    }

    // Check bundle type restriction (shorthand)
    if (field.bundleTypes && field.bundleTypes.length > 0) {
        if (
            !(field.bundleTypes as string[]).includes(context.activeBundleType)
        ) {
            return false;
        }
    }

    // Check showWhen conditions
    if (field.showWhen) {
        return evaluateConditions(field.showWhen, context);
    }

    return true;
}

/**
 * Checks if a section should be visible based on all conditions.
 */
export function isSectionVisible(
    section: CustomizerSectionConfig,
    context: ConditionContext,
): boolean {
    // Check layout restriction (shorthand)
    if (section.layouts && section.layouts.length > 0) {
        if (!section.layouts.includes(context.activeLayout)) {
            return false;
        }
    }

    // Check bundle type restriction (shorthand)
    if (section.bundleTypes && section.bundleTypes.length > 0) {
        if (
            !(section.bundleTypes as string[]).includes(
                context.activeBundleType,
            )
        ) {
            return false;
        }
    }

    // Check showWhen conditions
    if (section.showWhen) {
        return evaluateConditions(section.showWhen, context);
    }

    return true;
}

/**
 * Filters fields based on visibility conditions.
 */
export function getVisibleFields(
    fields: CustomizerFieldConfig[],
    context: ConditionContext,
): CustomizerFieldConfig[] {
    return fields.filter((field) => isFieldVisible(field, context));
}

/**
 * Filters sections based on visibility conditions.
 */
export function getVisibleSections(
    sections: CustomizerSectionConfig[],
    context: ConditionContext,
): CustomizerSectionConfig[] {
    return sections.filter((section) => isSectionVisible(section, context));
}

/**
 * Creates a condition context from individual values.
 * Helper for components that don't have the full context object.
 */
export function createConditionContext(
    styles: CustomizerStyles,
    activeLayout: WidgetLayout,
    activeBundleType: PreviewTemplateId,
    activeDevice: "desktop" | "tablet" | "mobile" = "desktop",
): ConditionContext {
    return {
        styles,
        activeLayout,
        activeBundleType,
        activeDevice,
    };
}
