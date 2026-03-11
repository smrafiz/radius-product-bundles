"use client";
import { useAppNavigation } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function DashboardBundlesEmpty({
    error,
}: {
    error?: string | null;
}) {
    const { bundleData } = useAppNavigation();
    const t = useTranslations("Dashboard.Bundles");

    const heading = error
        ? t("unableToLoad")
        : t("noActive");

    const description = error
        ? t("errorDesc")
        : t("noActiveDesc");

    return (
        <s-section accessibilityLabel="Empty state section">
            <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
                <s-box maxInlineSize="200px" maxBlockSize="200px">
                    <s-image
                        aspectRatio="1/1"
                        src="/assets/empty.png"
                        alt="A stylized graphic of four characters, each holding a puzzle piece"
                    />
                </s-box>
                <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
                    <s-stack
                        alignItems="center"
                        justifyContent="center"
                        gap="small-300"
                    >
                        <s-heading>{heading}</s-heading>
                        <s-paragraph>
                            <div className="text-center">{description}</div>
                        </s-paragraph>
                    </s-stack>
                    {!error && (
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel={t("createBundle")}
                            onClick={bundleData.create()}
                        >
                            {t("createBundle")}
                        </s-button>
                    )}
                </s-grid>
            </s-grid>
        </s-section>
    );
}
