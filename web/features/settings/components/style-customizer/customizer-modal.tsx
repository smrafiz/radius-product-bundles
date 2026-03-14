"use client";

import { ROUTES } from "@/shared";
import { useCustomizerModal } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Customizer modal launcher component.
 */
export function CustomizerModal() {
    const { appWindowRef } = useCustomizerModal();
    const t = useTranslations("Settings.Customizer");

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
                {t("openStyleCustomizer")}
            </s-button>
        </div>
    );
}
