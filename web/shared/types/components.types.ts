import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

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
    children: ReactNode;
    onSubmit?: (data: T) => Promise<void> | void;
    resetDirty: () => void;
    discardPath?: string;
}

/*
 * ConfirmationModal Props
 */
export interface ConfirmationModalProps {
    open: boolean;
    title: string;
    message: React.ReactNode;
    loading?: boolean;
    destructive?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export interface KnobProps {
    ariaLabel: string;
    selected: boolean;
    onClick: () => void;
}

