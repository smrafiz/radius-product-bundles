"use client";

import { RATING_MESSAGES } from "@/features/dashboard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";

const MAX_RATING = 5;
const MODAL_ID = "dashboard-review-modal";

export function DashboardReviewBanner() {
    const [currentRating, setCurrentRating] = useState(0);
    const modalRef = useRef<HTMLElement | null>(null);
    const t = useTranslations("Dashboard.Review");

    const starTooltips = [
        t("starTooltips.1"),
        t("starTooltips.2"),
        t("starTooltips.3"),
        t("starTooltips.4"),
        t("starTooltips.5"),
    ];

    const bannerTitle = t("ratings.0.title");
    const bannerDescription = t("ratings.0.description");
    const modalTitle = t(`ratings.${currentRating}.title`);
    const modalDescription = t(`ratings.${currentRating}.description`);

    const openModal = useCallback((star: number) => {
        setCurrentRating(star);
        (modalRef.current as any)?.showOverlay?.();
    }, []);

    const handleClose = useCallback(() => {
        setCurrentRating(0);
    }, []);

    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        modal.addEventListener("hide", handleClose);
        return () => modal.removeEventListener("hide", handleClose);
    }, [handleClose]);

    return (
        <>
            {/* Banner Card */}
            <s-section padding="base">
                <s-stack gap="base">
                    <s-grid
                        gridTemplateColumns="1fr auto"
                        alignItems="start"
                        gap="small"
                    >
                        <s-stack gap="small-200">
                            <s-heading>{bannerTitle}</s-heading>
                            <s-text color="subdued">
                                {bannerDescription}
                            </s-text>
                        </s-stack>
                    </s-grid>

                    {/* Star Rating — opens modal on click */}
                    <s-stack direction="inline">
                        {Array.from(
                            { length: MAX_RATING },
                            (_, i) => i + 1,
                        ).map((star) => (
                            <React.Fragment key={star}>
                                <s-tooltip id={`star-${star}-tooltip`}>
                                    {starTooltips[star - 1]}
                                </s-tooltip>
                                <s-button
                                    variant="tertiary"
                                    accessibilityLabel={starTooltips[star - 1]}
                                    onClick={() => openModal(star)}
                                    interestFor={`star-${star}-tooltip`}
                                    icon="star"
                                />
                            </React.Fragment>
                        ))}
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Feedback Modal */}
            <s-modal
                size="base"
                id={MODAL_ID}
                ref={modalRef as any}
                heading={t("shareYourFeedback")}
                accessibilityLabel={t("shareYourFeedback")}
            >
                <s-stack gap="base">
                    <s-stack gap="small-200">
                        <s-heading>{modalTitle}</s-heading>
                        <s-text color="subdued">
                            {modalDescription}
                        </s-text>
                    </s-stack>

                    {/* Star Rating inside modal — no tooltips to avoid z-index conflicts */}
                    <s-stack direction="inline">
                        {Array.from(
                            { length: MAX_RATING },
                            (_, i) => i + 1,
                        ).map((star) => (
                            <s-button
                                key={star}
                                accessibilityLabel={starTooltips[star - 1]}
                                variant="tertiary"
                                onClick={() => setCurrentRating(star)}
                                icon={
                                    star <= currentRating
                                        ? "star-filled"
                                        : "star"
                                }
                            />
                        ))}
                    </s-stack>

                    <s-divider />

                    {/* Feedback Form */}
                    <s-text-area
                        label={
                            currentRating <= 3
                                ? t("whatCanWeImprove")
                                : t("whatDidYouLikeMost")
                        }
                        rows={3}
                    />

                    {/* Additional Actions for High Ratings */}
                    {currentRating >= 4 && (
                        <s-stack
                            gap="small"
                            padding="small"
                            background="subdued"
                            borderRadius="base"
                        >
                            <s-heading>
                                {t("helpBySharing")}
                            </s-heading>
                            <s-stack direction="inline" gap="small">
                                <s-button icon="external">
                                    {t("rateOnAppStore")}
                                </s-button>
                                <s-button>{t("shareWithFriends")}</s-button>
                            </s-stack>
                        </s-stack>
                    )}

                    {/* Support Options for Low Ratings */}
                    {currentRating <= 3 && (
                        <s-stack
                            gap="small"
                            padding="small"
                            background="subdued"
                            borderRadius="base"
                        >
                            <s-heading>{t("needImmediateHelp")}</s-heading>
                            <s-stack direction="inline" gap="small">
                                <s-button icon="email">
                                    {t("contactSupport")}
                                </s-button>
                                <s-button icon="question-circle">
                                    {t("viewHelpCenter")}
                                </s-button>
                            </s-stack>
                        </s-stack>
                    )}
                </s-stack>

                <s-button
                    slot="primary-action"
                    variant="primary"
                    commandFor={MODAL_ID}
                    command="--hide"
                >
                    {t("submitFeedback")}
                </s-button>
            </s-modal>
        </>
    );
}
