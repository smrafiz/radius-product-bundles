"use client";

import { SetupItemProps } from "@/features/dashboard";

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
    const isDisabled = autoDetected || complete;

    return (
        <s-box paddingBlock="small-200">
            <s-grid
                gridTemplateColumns="1fr auto"
                gap="base"
                paddingInline="base"
            >
                <div
                    className="flex items-center gap-2 min-h-8"
                    onClick={!expanded ? setExpanded : undefined}
                    style={!expanded ? { cursor: "pointer" } : undefined}
                >
                    {checkboxLoading ? (
                        <>
                            <div className="w-4 h-5 block">
                                <s-spinner size="base" />
                            </div>
                            <s-text>{title}</s-text>
                        </>
                    ) : (
                        <s-checkbox
                            label={title}
                            checked={complete}
                            onChange={onCheckboxChange}
                            disabled={isDisabled}
                        />
                    )}
                </div>
                <s-button
                    accessibilityLabel={`Toggle ${title} details`}
                    variant="tertiary"
                    icon={expanded ? "chevron-up" : "chevron-down"}
                    onClick={setExpanded}
                />
            </s-grid>

            <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden">
                    <s-box padding="base" paddingBlockEnd="small-200">
                        <s-box
                            padding="base"
                            background="subdued"
                            borderRadius="base"
                        >
                            <s-grid
                                gridTemplateColumns={image ? "1fr auto" : "1fr"}
                                gap="base"
                                alignItems="center"
                                paddingBlock="small-200"
                            >
                                <s-grid gap="base">
                                    <s-paragraph>{description}</s-paragraph>
                                    {(primaryButton || secondaryButton) && (
                                        <s-stack
                                            direction="inline"
                                            gap="small-200"
                                        >
                                            {primaryButton && (
                                                <s-button
                                                    variant="primary"
                                                    onClick={onPrimaryClick}
                                                    loading={
                                                        buttonLoading ===
                                                        "primary"
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
                        </s-box>
                    </s-box>
                </div>
            </div>
        </s-box>
    );
};
