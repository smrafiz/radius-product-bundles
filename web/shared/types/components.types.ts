import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

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