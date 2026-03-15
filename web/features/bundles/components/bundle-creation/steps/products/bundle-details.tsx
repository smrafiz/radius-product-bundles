"use client";

import {
    BundleType,
    useBundleField,
    useBundleFormManager,
    useBundleValidation,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle details input component for name and description
 */
export function BundleDetails({ bundleType }: { bundleType: BundleType }) {
    const t = useTranslations("Bundles.Creation.Details");
    const { getFieldError } = useBundleValidation();
    const { isGeneratingName } = useBundleFormManager({
        bundleType,
        bundleName: "",
    });

    const nameField = useBundleField<string>("name");
    const descriptionField = useBundleField<string>("description");

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>{t("heading")}</s-heading>
                <s-tooltip id="bundle-details-tooltip">
                    <s-text>
                        {t("tooltip")}
                    </s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bundle-details-tooltip"
                />
            </s-stack>
            <s-stack>
                <s-text-field
                    label={t("name")}
                    value={nameField.value || ""}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        nameField.handleChange(target.value);
                    }}
                    onBlur={nameField.handleBlur}
                    placeholder={
                        isGeneratingName
                            ? t("namePlaceholderGenerating")
                            : t("namePlaceholder")
                    }
                    details={t("nameDetails")}
                    error={getFieldError("name")}
                    disabled={isGeneratingName}
                    maxLength={100}
                    required
                ></s-text-field>
            </s-stack>

            <s-text-area
                label={t("description")}
                value={descriptionField.value || ""}
                onChange={(event: Event) => {
                    const target = event.target as HTMLTextAreaElement;
                    descriptionField.handleChange(target.value);
                }}
                onBlur={descriptionField.handleBlur}
                rows={3}
                placeholder={t("descriptionPlaceholder")}
                details={t("descriptionDetails")}
                error={getFieldError("description")}
                maxLength={300}
            />
        </s-stack>
    );
}
