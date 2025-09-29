import { useState, useCallback } from "react";

export function useConfirmation() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        message: string | React.ReactNode;
        confirmLabel?: string;
        destructive?: boolean;
        onConfirm: () => Promise<void> | void;
    } | null>(null);

    const confirm = useCallback((config: {
        title: string;
        message: string | React.ReactNode;
        confirmLabel?: string;
        destructive?: boolean;
        onConfirm: () => Promise<void> | void;
    }) => {
        setState({ ...config, open: true });
    }, []);

    const close = useCallback(() => {
        setState(null);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (state?.onConfirm) {
            await state.onConfirm();
        }
        close();
    }, [state, close]);

    return {
        confirm,
        close,
        modalProps: state ? {
            open: state.open,
            title: state.title,
            message: state.message,
            confirmLabel: state.confirmLabel,
            destructive: state.destructive,
            onClose: close,
            onConfirm: handleConfirm,
        } : null,
    };
}