"use client";

import { TitleBar } from "@shopify/app-bridge-react";
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
            <TitleBar title={t("title")}>
                <button onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`)}>
                    {t("email")}
                </button>
                <button onClick={() => window.open(DOCS_URL, "_blank")}>
                    {t("docs")}
                </button>
            </TitleBar>

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
