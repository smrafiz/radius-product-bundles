"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { SupportQuickActions } from "../support-quick-actions/support-quick-actions";
import { SupportFaq } from "../support-faq/support-faq";
import { SupportSidePanel } from "../support-side-panel/support-side-panel";
import {
    DOCS_URL,
    SUPPORT_EMAIL,
} from "@/features/support/constants/support.constants";

export function SupportPage() {
    const t = useTranslations("Support");

    return (
        <s-page heading={t("title")}>
            <s-button
                variant="primary"
                slot="primary-action"
                onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`)}
            >
                {t("email")}
            </s-button>
            <s-button
                variant="secondary"
                slot="secondary-actions"
                onClick={() => window.open(DOCS_URL, "_blank")}
            >
                {t("docs")}
            </s-button>

            <s-stack gap="large">
                <SupportQuickActions />

                <s-grid
                    gridTemplateColumns="1fr 280px"
                    gap="base"
                    alignItems="start"
                >
                    <s-grid-item>
                        <SupportFaq />
                    </s-grid-item>
                    <s-grid-item>
                        <SupportSidePanel />
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-page>
    );
}
