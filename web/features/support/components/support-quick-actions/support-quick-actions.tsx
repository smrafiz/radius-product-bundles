"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import {
    DOCS_URL,
    VIDEOS_URL,
    SUPPORT_EMAIL,
} from "@/features/support/constants/support.constants";

const ICON_STYLES: Record<string, CSSProperties> = {
    docs: { background: "linear-gradient(135deg,#B9FFE1,#B9FFE1)" },
    videos: { background: "linear-gradient(135deg,#FFDDDE,#FFDDDE)" },
    email: { background: "linear-gradient(135deg,#E2DBFF,#E2DBFF)" },
};

export function SupportQuickActions() {
    const t = useTranslations("Support");

    const cards = [
        {
            icon: "assets/documentation.svg",
            iconStyle: ICON_STYLES.docs,
            title: t("docs"),
            description: t("docsDescription"),
            label: DOCS_URL.replace("https://", ""),
            onClick: () => window.open(DOCS_URL, "_blank"),
        },
        {
            icon: "assets/video.svg",
            iconStyle: ICON_STYLES.videos,
            title: t("videos"),
            description: t("videosDescription"),
            label: VIDEOS_URL.replace("https://", ""),
            onClick: () => window.open(VIDEOS_URL, "_blank"),
        },
        {
            icon: "assets/email.svg",
            iconStyle: ICON_STYLES.email,
            title: t("email"),
            description: t("emailDescription"),
            label: SUPPORT_EMAIL,
            onClick: () => window.open(`mailto:${SUPPORT_EMAIL}`),
        },
    ];

    return (
        <s-section padding="base">
            <s-stack gap="base">
                <s-heading>{t("getHelp")}</s-heading>
                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
                    gap="base"
                >
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="transition-all hover:-translate-y-[3px]"
                        >
                            <s-grid-item>
                                <s-clickable
                                    border="base"
                                    borderRadius="base"
                                    padding="base"
                                    inlineSize="100%"
                                    accessibilityLabel={card.title}
                                    onClick={card.onClick}
                                >
                                    <s-grid
                                        gridTemplateColumns="auto 1fr"
                                        gap="base"
                                        alignItems="start"
                                    >
                                        <s-box>
                                            <div
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 8,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 20,
                                                    ...card.iconStyle,
                                                }}
                                            >
                                                <img src={`/${card.icon}`} alt="" width={16} height={14} />
                                            </div>
                                        </s-box>
                                        <s-box>
                                            <s-heading>{card.title}</s-heading>
                                            <s-paragraph>
                                                {card.description}
                                            </s-paragraph>
                                            <s-text color="subdued">
                                                {card.label}
                                            </s-text>
                                        </s-box>
                                    </s-grid>
                                </s-clickable>
                            </s-grid-item>
                        </div>
                    ))}
                </s-grid>
            </s-stack>
        </s-section>
    );
}
