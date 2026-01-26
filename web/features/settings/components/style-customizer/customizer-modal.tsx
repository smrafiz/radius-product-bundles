"use client";

import { ROUTES } from "@/shared";
import { useRefetchSettings } from "@/features/settings";
import { useEffect, useRef } from "react";

/**
 * Customizer modal launcher component.
 *
 * Opens the style customizer in an app window and refetches settings when closed.
 */
export function CustomizerModal() {
    const { refetch } = useRefetchSettings();
    const appWindowRef = useRef<HTMLElement>(null);

    /**
     * Handles the app window close event.
     * Refetches settings to sync any changes made in the customizer.
     */
    const handleClose = () => {
        void refetch();
    };

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

    return (
        <div>
            <s-app-window
                ref={appWindowRef}
                id="rtpb-window"
                src={ROUTES.CUSTOMIZER}
            ></s-app-window>
            <s-button
                variant="primary"
                command="--show"
                commandFor="rtpb-window"
            >
                Open style customizer
            </s-button>
        </div>
    );
}
