"use client";

import { ROUTES } from "@/shared";
import { useCustomizerModal } from "@/features/settings";

/**
 * Customizer modal launcher component.
 */
export function CustomizerModal() {
    const { appWindowRef } = useCustomizerModal();

    return (
        <div>
            <s-app-window
                ref={appWindowRef}
                id="rtpb-window"
                src={ROUTES.CUSTOMIZER}
            />
            <s-button
                variant="primary"
                command="--show"
                commandFor="rtpb-window"
                icon="edit"
            >
                Open style customizer
            </s-button>
        </div>
    );
}
