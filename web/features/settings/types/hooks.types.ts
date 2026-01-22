/*
 * Save bar props.
 */
export interface UseSaveBarProps {
    isDirty: boolean;
    isLoading?: boolean;
    onSave: () => void | Promise<void>;
    onDiscard: () => void;
    formId?: string;
}
