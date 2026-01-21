import { AppSettingsFormData } from "@/features/settings";

export interface SettingsFormProviderProps {
    children: React.ReactNode;
    initialData?: Partial<AppSettingsFormData>;
    onDirtyChange?: (isDirty: boolean) => void;
}