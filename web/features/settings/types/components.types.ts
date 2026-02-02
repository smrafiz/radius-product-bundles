import {
    AppSettingsFormData,
    ConditionContext,
    CustomizerFieldConfig,
} from "@/features/settings";

/*
 * Settings form provider props
 */
export interface SettingsFormProviderProps {
    children: React.ReactNode;
    initialData?: Partial<AppSettingsFormData>;
    onDirtyChange?: (isDirty: boolean) => void;
}

/*
 * Dynamic customizer field props
 */
export interface DynamicCustomizerFieldProps {
    config: CustomizerFieldConfig;
    context: ConditionContext;
    onFieldChangeAction?: () => void;
    resetKey?: number;
}

/*
 * Responsive field indicator props
 */
export interface ResponsiveFieldIndicatorProps {
    activeDevice: "desktop" | "tablet" | "mobile";
    isInherited: boolean;
    onOverride: () => void;
    onClearOverride: () => void;
}
