"use client";

import { SetupItemProps } from "@/features/dashboard";
import { useTranslations } from "@/lib/i18n/provider";

const DashedCircle = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0"
    >
        <circle
            cx="10"
            cy="10"
            r="8.5"
            stroke="#8a8a8a"
            strokeWidth="2"
            strokeDasharray="3 3"
            fill="none"
        />
    </svg>
);

const CheckCircle = () => (
    <svg
        width="20"
        height="20"
        viewBox="2 2 20 20"
        fill="none"
        className="shrink-0"
    >
        <circle cx="12" cy="12" r="10" fill="#303030" />
        <path
            d="M17.2738 8.52629C17.6643 8.91682 17.6643 9.54998 17.2738 9.94051L11.4405 15.7738C11.05 16.1644 10.4168 16.1644 10.0263 15.7738L7.3596 13.1072C6.96908 12.7166 6.96908 12.0835 7.3596 11.693C7.75013 11.3024 8.38329 11.3024 8.77382 11.693L10.7334 13.6525L15.8596 8.52629C16.2501 8.13577 16.8833 8.13577 17.2738 8.52629Z"
            fill="white"
        />
    </svg>
);

export const DashboardSetupItem = ({
    complete,
    autoDetected,
    expanded,
    setExpanded,
    checkboxLoading,
    buttonLoading,
    onCheckboxChange,
    onPrimaryClick,
    onSecondaryClick,
    title,
    description,
    image,
    primaryButton,
    secondaryButton,
}: SetupItemProps) => {
    const t = useTranslations("Dashboard.SetupGuide");
    const canToggle = !autoDetected;

    const handleCircleClick = (e: React.MouseEvent) => {
        if (canToggle) {
            e.stopPropagation();
            onCheckboxChange();
        }
    };

    return (
        <div
            className={`rounded-xl transition-colors duration-200 ${expanded ? "bg-[#f7f7f7]" : "hover:bg-[#f7f7f7]"}`}
        >
            <div
                className="flex items-center gap-3 min-h-10 px-2 py-3 cursor-pointer"
                onClick={setExpanded}
            >
                {checkboxLoading ? (
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <s-spinner size="base" />
                    </div>
                ) : (
                    <div
                        onClick={handleCircleClick}
                        className={canToggle ? "cursor-pointer" : ""}
                        title={
                            canToggle
                                ? complete
                                    ? t("markIncomplete")
                                    : t("markComplete")
                                : undefined
                        }
                    >
                        {complete ? <CheckCircle /> : <DashedCircle />}
                    </div>
                )}
                <span
                    className={`text-[13px] transition-[font-weight] duration-200 ${expanded ? "font-semibold" : "font-[450]"} ${complete && !expanded ? "text-[#8a8a8a]" : ""}`}
                >
                    {title}
                </span>
            </div>

            <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4">
                        <s-grid
                            gridTemplateColumns={image ? "1fr auto" : "1fr"}
                            gap="base"
                            alignItems="center"
                        >
                            <s-grid gap="base">
                                <s-paragraph>{description}</s-paragraph>
                                {(primaryButton || secondaryButton) && (
                                    <s-stack direction="inline" gap="small-200">
                                        {primaryButton && (
                                            <s-button
                                                variant="primary"
                                                onClick={onPrimaryClick}
                                                loading={
                                                    buttonLoading === "primary"
                                                }
                                                disabled={
                                                    buttonLoading !== null
                                                }
                                            >
                                                {primaryButton.content}
                                            </s-button>
                                        )}
                                        {secondaryButton && (
                                            <s-button
                                                variant="tertiary"
                                                onClick={onSecondaryClick}
                                                loading={
                                                    buttonLoading ===
                                                    "secondary"
                                                }
                                                disabled={
                                                    buttonLoading !== null
                                                }
                                            >
                                                {secondaryButton.content}
                                            </s-button>
                                        )}
                                    </s-stack>
                                )}
                            </s-grid>
                            {image && (
                                <s-box maxInlineSize="200px">
                                    <s-image
                                        src={image.url}
                                        alt={image.alt}
                                        aspectRatio="16/9"
                                    />
                                </s-box>
                            )}
                        </s-grid>
                    </div>
                </div>
            </div>
        </div>
    );
};
