"use client";

import React from "react";
import { PREVIEW_TEMPLATE_OPTIONS } from "@/features/settings/constants/customizer.constants";
import { useTranslations } from "@/lib/i18n/provider";

export function BundleTypeTab({
    activeId,
    onChangeAction,
}: {
    activeId: string;
    onChangeAction: (id: string) => void;
}) {
    const t = useTranslations("Settings.Customizer");
    const tt = useTranslations("Bundles.Types");

    return (
        <s-section>
            <s-stack direction="inline" alignItems="center" gap="small">
                <s-heading>{t("templateType.title")}</s-heading>
                <s-stack direction="inline">
                    <div className="min-w-60">
                        <s-select
                            value={activeId}
                            icon="package"
                            label={t("templateType.label")}
                            labelAccessibilityVisibility="exclusive"
                            onChange={(e: Event) => {
                                const target = e.target as HTMLSelectElement;
                                onChangeAction(target.value);
                            }}
                        >
                            {PREVIEW_TEMPLATE_OPTIONS.map((opt) => (
                                <s-option key={opt.id} value={opt.id}>
                                    {opt.id === "CART_BANNER"
                                        ? t("cartPageBanner")
                                        : tt(`${opt.id}.label`)}
                                </s-option>
                            ))}
                        </s-select>
                    </div>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
