import { ReactNode } from "react";

/*
 * ConfirmationModal Props
 */
export interface ConfirmationModalProps {
    open: boolean;
    title: string;
    message: ReactNode;
    loading?: boolean;
    destructive?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}
