"use client";

import { useEffect, useRef } from "react";
import { ROUTES } from "@/shared";
import { useCustomizerModal } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Customizer modal launcher component.
 */
export function CustomizerModal() {
    const { appWindowRef } = useCustomizerModal();
    const t = useTranslations("Settings.Customizer");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerRef = useRef<any>(null);

    // Return focus to the opener button when the app window closes
    useEffect(() => {
        const appWindow = appWindowRef.current;

        if (!appWindow) {
            return;
        }

        const handleHide = () => {
            triggerRef.current?.focus();
        };

        appWindow.addEventListener("hide", handleHide);

        return () => {
            appWindow.removeEventListener("hide", handleHide);
        };
    }, [appWindowRef]);

    return (
        <div>
            <s-app-window
                ref={appWindowRef}
                id="rtpb-window"
                src={ROUTES.CUSTOMIZER}
            />
            <s-button
                ref={triggerRef}
                variant="primary"
                command="--show"
                commandFor="rtpb-window"
                icon="edit"
            >
                {t("openStyleCustomizer")}
            </s-button>
        </div>
    );
}
