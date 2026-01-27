"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRefetchSettings } from "@/features/settings";

/**
 * Hook for managing the customizer modal behavior.
 */
export function useCustomizerModal() {
    const { refetch } = useRefetchSettings();
    const appWindowRef = useRef<HTMLElement>(null);

    /**
     * Handles the app window close event.
     */
    const handleClose = useCallback(() => {
        void refetch();
    }, [refetch]);

    // Attach close event listener
    useEffect(() => {
        const appWindow = appWindowRef.current;

        if (!appWindow) {
            return;
        }

        appWindow.addEventListener("hide", handleClose);

        return () => {
            appWindow.removeEventListener("hide", handleClose);
        };
    }, [handleClose]);

    return {
        appWindowRef,
    };
}
