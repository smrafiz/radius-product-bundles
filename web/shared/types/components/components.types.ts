import { FieldErrors, FieldValues } from "react-hook-form";

export interface CalloutButtonProps {
    content: string;
    props?: {
        url?: string;
        external?: boolean;
    };
    tone?:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
}

export interface CalloutCardProps {
    title: string;
    icon: string;
    description: string;
    primaryButton?: CalloutButtonProps | null;
}

/*
 * GlobalForm Props
 */
export interface GlobalFormProps<T extends FieldValues> {
    children: React.ReactNode;
    onSubmit: (data: T) => Promise<void>;
    resetDirty?: () => void;
    /** Unique form identifier for multiple forms */
    formId?: string;
    /** Maps field names to step numbers (for multi-step forms) */
    stepFieldMap?: Record<string, number>;
    /** Custom validation error handler */
    onValidationError?: (error: {
        step?: number;
        field: string;
        errors: FieldErrors<T>;
        message: string;
    }) => void;
}
