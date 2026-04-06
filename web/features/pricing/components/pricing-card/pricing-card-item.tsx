"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { PricingCardItemInfo } from "@/features/pricing";

export function PricingCardItem({
    title,
    description,
    price,
    features,
    featuredText,
    trialBadge,
    primaryButton,
    frequency,
    annualEquivalent,
    onSubscribe,
    isPlanLoading,
}: PricingCardItemInfo & { isPlanLoading?: boolean }) {
    const t = useTranslations("Pricing");

    const handleClick = async () => {
        if (onSubscribe) {
            await onSubscribe();
        }
    };

    const isPro = !!featuredText;

    return (
        <div
            className={`relative z-0 rounded-xl w-full flex flex-col ${
                isPro
                    ? "shadow-[0_0_20px_4px_#d1fae5] ring-2 ring-green-200"
                    : ""
            }`}
        >
            {featuredText ? (
                <div className="absolute -top-3.75 right-1.5 z-50">
                    <s-badge tone="success">{featuredText}</s-badge>
                </div>
            ) : null}
            <div className="flex flex-col flex-1 rounded-xl bg-white border border-gray-200 p-6">
                <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-gray-900">{title}</p>
                    <hr className="border-gray-200 my-2" />
                    {description ? (
                        <p className="text-sm text-gray-500">{description}</p>
                    ) : null}
                </div>

                <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{price}</span>
                        <span className="text-sm text-gray-500">/ {frequency}</span>
                    </div>
                    {annualEquivalent ? (
                        <p className="text-xs text-gray-400 mt-1">{annualEquivalent}</p>
                    ) : null}
                </div>

                {trialBadge ? (
                    <div className="mt-3">
                        <s-badge tone="info">{trialBadge}</s-badge>
                    </div>
                ) : null}

                <div className="flex-1 mt-6">
                    <ul className="flex flex-col gap-3">
                        {features?.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <s-icon type="check" tone="success" size="small" />
                                <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6">
                    {isPlanLoading ? (
                        <div className="h-7 w-27.5 rounded-lg bg-gray-100 animate-pulse" />
                    ) : (
                        <s-button
                            {...primaryButton.props}
                            loading={primaryButton.loading}
                            disabled={primaryButton.loading || primaryButton.props.disabled}
                            onClick={handleClick}
                        >
                            {primaryButton.content}
                        </s-button>
                    )}
                </div>
            </div>
        </div>
    );
}
