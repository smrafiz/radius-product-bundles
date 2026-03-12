import { AppSettingsFormData } from "@/features/settings";

/**
 * Input for getting settings
 */
export interface GetSettingsInput {
    shop: string;
    locale?: string;
}

/**
 * Input for saving settings
 */
export interface SaveSettingsInput {
    shop: string;
    data: AppSettingsFormData;
    locale?: string;
}
