/**
 * Input for getting settings
 */
export interface GetSettingsInput {
    shop: string;
}

/**
 * Input for saving settings
 */
export interface SaveSettingsInput {
    shop: string;
    data: AppSettingsFormData;
}