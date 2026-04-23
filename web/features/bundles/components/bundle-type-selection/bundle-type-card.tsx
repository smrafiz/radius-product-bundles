"use client";

import {
    useAppNavigation,
    withLoader,
    usePlan,
    ProBadge,
    useCrossSellStore,
} from "@/shared";
import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { BundleConfig, useBundleSelectionStore } from "@/features/bundles";

export function BundleTypeCard({ bundleType }: { bundleType: BundleConfig }) {
    const t = useTranslations("Bundles.Selection");
    const tt = useTranslations("Bundles.Types");
    const { bundleData } = useAppNavigation();
    const { selectingBundleId, setSelectingBundleId, reset } =
        useBundleSelectionStore();
    const { canUse } = usePlan();
    const { open } = useCrossSellStore();

    useEffect(() => reset(), []);

    const isThisCardSelecting = selectingBundleId === bundleType.id;
    const isAnotherCardSelecting =
        selectingBundleId !== null && !isThisCardSelecting;
    const isProLocked =
        bundleType.proRequired === true && !canUse("volume_discount");

    const handleSelect = async () => {
        if (isProLocked) {
            open("volume discount");
            return;
        }

        setSelectingBundleId(bundleType.id);

        try {
            const navigate = bundleData.create(bundleType.slug);
            navigate();

            setTimeout(() => {
                const modal = document.getElementById(`modal-${bundleType.id}`);
                if (modal) modal.remove();
            }, 300);
        } catch (error) {
            console.error("Navigation error:", error);
            setSelectingBundleId(null);
        }
    };

    return (
        <div className="relative">
            <s-section>
                <s-stack gap="base" paddingBlockEnd="base">
                    <div className="absolute right-4 top-4">
                        {isProLocked ? (
                            <ProBadge />
                        ) : bundleType.badge ? (
                            <s-badge tone={bundleType.badge.tone}>
                                {tt("comingSoon")}
                            </s-badge>
                        ) : null}
                    </div>

                    {bundleType.bundleImage && (
                        <s-box>
                            <div className="flex items-center py-8 px-6 justify-center bg-[#f7f7f7] rounded-md min-h-36.25 w-full">
                                <s-image
                                    aspectRatio="16/9"
                                    src={bundleType.bundleImage}
                                    alt={tt(bundleType.id + ".label")}
                                />
                            </div>
                        </s-box>
                    )}
                </s-stack>
                <s-stack gap="small-300">
                    <s-stack>
                        <s-heading>{tt(bundleType.id + ".label")}</s-heading>
                    </s-stack>

                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <s-stack gap="small">
                            <s-button
                                variant="secondary"
                                onClick={
                                    isProLocked
                                        ? handleSelect
                                        : withLoader(handleSelect)
                                }
                                loading={isThisCardSelecting}
                                disabled={
                                    bundleType.comingSoon ||
                                    isAnotherCardSelecting
                                }
                                accessibilityLabel={t("select")}
                            >
                                {bundleType.comingSoon
                                    ? t("comingSoon")
                                    : t("select")}
                            </s-button>
                        </s-stack>
                        <s-button
                            commandFor={`modal-${bundleType.id}`}
                            accessibilityLabel={`${tt(bundleType.id + ".label")} — ${t("learnMore")}`}
                        >
                            <s-icon type="question-circle" />
                        </s-button>

                        <s-modal
                            id={`modal-${bundleType.id}`}
                            heading={tt(bundleType.id + ".label")}
                            accessibilityLabel={tt(bundleType.id + ".label")}
                        >
                            <s-stack gap="base">
                                {bundleType.modalImage && (
                                    <s-stack>
                                        <img
                                            src={bundleType.modalImage}
                                            alt={tt(bundleType.id + ".label")}
                                        />
                                    </s-stack>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <s-heading>
                                        {tt(bundleType.id + ".description")}
                                    </s-heading>
                                    {bundleType.features &&
                                        bundleType.features.length > 0 && (
                                            <s-unordered-list>
                                                {bundleType.features.map(
                                                    (_, index) => (
                                                        <s-list-item
                                                            key={index}
                                                        >
                                                            {tt(`${bundleType.id}.features.${index}`)}
                                                        </s-list-item>
                                                    ),
                                                )}
                                            </s-unordered-list>
                                        )}
                                </div>
                                <s-stack>
                                    <s-button
                                        variant="primary"
                                        onClick={
                                            isProLocked
                                                ? handleSelect
                                                : withLoader(handleSelect)
                                        }
                                        loading={isThisCardSelecting}
                                        disabled={isAnotherCardSelecting}
                                    >
                                        {bundleType.comingSoon
                                            ? t("comingSoon")
                                            : t("createBundle")}
                                    </s-button>
                                </s-stack>
                            </s-stack>
                        </s-modal>
                    </s-stack>
                </s-stack>
            </s-section>
        </div>
    );
}
