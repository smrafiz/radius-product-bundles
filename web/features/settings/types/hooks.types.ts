import { AppSettingsFormData } from "@/features/settings";

/**
 * Options for settings form mode.
 */
export interface SettingsModeOptions {
    mode: "settings";
    formState: {
        isDirty: boolean;
        isValid: boolean;
        isSubmitting: boolean;
    };
    reset: (data?: AppSettingsFormData) => void;
    trigger: () => Promise<boolean>;
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}

/**
 * Options for customizer mode.
 */
export interface CustomizerModeOptions {
    mode: "customizer";
    currentSettings: AppSettingsFormData | null | undefined;
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}

/**
 * Options when no mode specified (uses settings form context).
 */
export interface DefaultModeOptions {
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}

export type UseSettingsSubmitOptions =
    | SettingsModeOptions
    | CustomizerModeOptions
    | DefaultModeOptions;
