"use client";

import { ROUTES } from "@/shared";
import { useRefetchSettings } from "@/features/settings";

/**
 * Customizer modal launcher component.
 *
 * Opens the style customizer in an app window and refetches settings when closed.
 */
export function CustomizerModal() {
    const { refetch } = useRefetchSettings();

    /**
     * Handles the app window close event.
     * Refetches settings to sync any changes made in the customizer.
     */
    const handleClose = () => {
        void refetch();
    };

    return (
        <div>
            <s-app-window
                id="rtpb-window"
                src={ROUTES.CUSTOMIZER}
                onClose={handleClose}
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
