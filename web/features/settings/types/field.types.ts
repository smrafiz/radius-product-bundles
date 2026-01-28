import { z } from "zod";
import { appSettingsSchema, CustomizerStyles } from "@/features/settings";

/**
 * Validation configuration
 */
export interface FieldValidation {
    required?: string;
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
}

/**
 * Base field configuration
 */
interface BaseFieldConfig {
    name: string;
    label: string;
    details?: string;
    placeholder?: string;
    validation?: FieldValidation;
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
    type: "text";
    defaultValue?: string;
}

/**
 * Textarea field configuration
 */
export interface TextAreaFieldConfig extends BaseFieldConfig {
    type: "textarea";
    rows?: number;
    defaultValue?: string;
}

/**
 * Number field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    readOnly?: boolean;
    defaultValue?: number;
}

/**
 * Number field configuration for customizer
 */
export interface CustomizerNumberFieldConfig extends BaseCustomizerFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    readOnly?: boolean;
    defaultValue?: number;
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
    type: "select";
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
}

/**
 * Select field configuration for customizer
 */
export interface CustomizerSelectFieldConfig extends BaseCustomizerFieldConfig {
    type: "select";
    options: Array<{ value: string | number; label: string }>;
    defaultValue?: string | number;
}

/**
 * Switch field configuration
 */
export interface SwitchFieldConfig extends BaseFieldConfig {
    type: "switch";
    defaultValue?: boolean;
}

/**
 * Custom component field
 */
export interface CustomFieldConfig extends BaseFieldConfig {
    type: "custom";
    component: string;
    defaultValue?: any;
}

/**
 * Union type for all field configurations
 */
export type FieldConfig =
    | TextFieldConfig
    | TextAreaFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | SwitchFieldConfig
    | CustomFieldConfig;

/**
 * Section configuration
 */
export interface SectionConfig {
    id: string;
    title: string;
    description?: string;
    tooltip?: string;
    fields: FieldConfig[];
    columns?: 1 | 2 | 3;
}

/**
 * Tab configuration
 */
export interface SettingsTabConfig {
    id: string;
    title: string;
    icon:
        | "settings"
        | "store-online"
        | "paint-brush-round"
        | "text-block"
        | "refresh"
        | "button"
        | "variant"
        | "apps"
        | "inventory"
        | "adjust"
        | "notification"
        | "dns-settings"
        | "wrench";
    sections?: SectionConfig[];
    parentPath?: string;
}

/**
 * Type inference from schema
 */
export type AppSettingsFormData = z.infer<typeof appSettingsSchema>;

/**
 * Base customizer field configuration
 */
export interface BaseCustomizerFieldConfig {
    name: keyof CustomizerStyles;
    label: string;
    details?: string;
}

/**
 * Color field configuration
 */
export interface ColorFieldConfig extends BaseCustomizerFieldConfig {
    type: "color";
    defaultValue?: string;
}

/**
 * Range slider field configuration
 */
export interface RangeFieldConfig extends BaseCustomizerFieldConfig {
    type: "range";
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
}

/**
 * Button group field configuration (for alignment, sizes, etc.)
 */
export interface ButtonGroupFieldConfig extends BaseCustomizerFieldConfig {
    type: "buttonGroup";
    options: Array<{ value: string | number; label: string }>;
    defaultValue?: string | number;
}

/**
 * Union type for all customizer field configurations
 */
export type CustomizerFieldConfig =
    | ColorFieldConfig
    | CustomizerNumberFieldConfig
    | RangeFieldConfig
    | ButtonGroupFieldConfig
    | CustomizerSelectFieldConfig;

/**
 * Customizer section configuration
 */
export interface CustomizerSectionConfig {
    id: string;
    title: string;
    description?: string;
    defaultOpen?: boolean;
    fields: CustomizerFieldConfig[];
    columns?: 1 | 2 | 3;
}

/**
 * Customizer panel configuration (for different bundle types)
 */
export interface CustomizerPanelConfig {
    id: string;
    title: string;
    sections: CustomizerSectionConfig[];
}

/**
 * Field group for rendering.
 */
export interface FieldGroup {
    id: string;
    isRange: boolean;
    fields: CustomizerFieldConfig[];
}
