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