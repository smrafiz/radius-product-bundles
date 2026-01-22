import { z } from "zod";
import { appSettingsSchema, labelsSchema } from "@/features/settings";

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
 * Labels type
 */
export type LabelsSettingsFormData = z.infer<typeof labelsSchema>;
