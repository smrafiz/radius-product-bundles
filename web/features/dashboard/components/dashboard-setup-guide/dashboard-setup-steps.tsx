"use client";

import { Fragment, useState } from "react";
import { useAppNavigation } from "@/shared";
import { SETUP_STEP_KEYS } from "../../constants/setup-guide.constants";
import type { SetupStepKey } from "../../types/setup-guide.types";

interface SetupItemButton {
    content: string;
    internalUrl?: string;
    props?: Record<string, any>;
}

interface SetupItemData {
    id: number;
    stepKey: string;
    title: string;
    description?: string;
    image?: { url: string; alt: string };
    complete: boolean;
    primaryButton?: SetupItemButton | null;
    secondaryButton?: SetupItemButton | null;
}

interface DashboardSetupGuideProps {
    onDismiss: () => void;
    onStepComplete: (key: SetupStepKey, value: boolean) => Promise<void> | void;
    isDismissing: boolean;
    items: SetupItemData[];
    shopDomain: string;
    apiKey: string;
}

export function DashboardSetupSteps({
    onDismiss,
    onStepComplete,
    isDismissing,
    items,
    shopDomain,
    apiKey,
}: DashboardSetupGuideProps) {
    const [expanded, setExpanded] = useState<number>(
        items.findIndex((item) => !item.complete),
    );
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const completedItemsLength = items.filter((item) => item.complete).length;

    return (
        <s-section padding="none">
            <s-box padding="base" paddingBlockEnd="none">
                <s-grid gap="small-200">
                    <s-grid
                        gridTemplateColumns="1fr auto auto"
                        gap="small-300"
                        alignItems="center"
                    >
                        <s-heading>Setup guide</s-heading>
                        <s-button
                            accessibilityLabel="Dismiss setup guide"
                            variant="tertiary"
                            tone="neutral"
                            icon="x"
                            onClick={onDismiss}
                            disabled={isDismissing}
                            loading={isDismissing}
                        />
                        <s-button
                            accessibilityLabel="Toggle setup guide"
                            variant="tertiary"
                            tone="neutral"
                            icon={isGuideOpen ? "chevron-up" : "chevron-down"}
                            onClick={() => {
                                setIsGuideOpen((prev) => {
                                    if (!prev)
                                        setExpanded(
                                            items.findIndex(
                                                (item) => !item.complete,
                                            ),
                                        );
                                    return !prev;
                                });
                            }}
                        />
                    </s-grid>
                    <s-paragraph>
                        Use this personalized guide to get your app up and
                        running.
                    </s-paragraph>

                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        paddingBlockEnd={!isGuideOpen ? "small" : "none"}
                    >
                        <div className="flex gap-4 w-full items-center">
                            {completedItemsLength === items.length ? (
                                <div className="max-h-4">
                                    <s-stack
                                        direction="inline"
                                        gap="small-200"
                                    >
                                        <div>
                                            <s-icon
                                                type="check"
                                                tone="success"
                                            />
                                        </div>
                                        <s-text color="subdued">Done</s-text>
                                    </s-stack>
                                </div>
                            ) : (
                                <s-text color="subdued">
                                    <div className="min-w-[100px]">
                                        {`${completedItemsLength} / ${items.length} completed`}
                                    </div>
                                </s-text>
                            )}

                            {completedItemsLength !== items.length ? (
                                <div className="w-full">
                                    <div className="w-full h-2 bg-[#ebebeb] rounded-md overflow-hidden">
                                        <div
                                            className="h-full bg-[#1a1a1a] rounded-[4px] transition-all duration-300 ease-in-out"
                                            style={{
                                                width: `${
                                                    (completedItemsLength /
                                                        items.length) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </s-stack>
                </s-grid>
            </s-box>

            <s-box
                borderRadius="base"
                display={isGuideOpen ? "auto" : "none"}
                paddingBlockStart="base"
            >
                <s-box padding="small-300">
                    {items.map((item, index) => (
                        <Fragment key={item.id}>
                            {index > 0 && <s-divider />}
                            <SetupItem
                                expanded={expanded === item.id}
                                setExpanded={() => setExpanded(item.id)}
                                onComplete={onStepComplete}
                                shopDomain={shopDomain}
                                apiKey={apiKey}
                                {...item}
                            />
                        </Fragment>
                    ))}
                </s-box>
            </s-box>
        </s-section>
    );
}

interface SetupItemProps extends SetupItemData {
    expanded: boolean;
    setExpanded: () => void;
    onComplete: (key: SetupStepKey, value: boolean) => Promise<void> | void;
    shopDomain: string;
    apiKey: string;
}

const SetupItem = ({
    complete,
    onComplete,
    expanded,
    setExpanded,
    title,
    description,
    image,
    primaryButton,
    secondaryButton,
    stepKey,
    shopDomain,
    apiKey,
}: SetupItemProps) => {
    const [loading, setLoading] = useState(false);
    const { goTo } = useAppNavigation();

    const completeItem = async () => {
        setLoading(true);
        await onComplete(stepKey as SetupStepKey, !complete);
        setLoading(false);
    };

    const handlePrimaryClick = () => {
        if (stepKey === SETUP_STEP_KEYS.APP_EMBED) {
            const url = `https://${shopDomain}/admin/themes/current/editor?context=apps&appEmbed=${encodeURIComponent(`${apiKey}/app-embed`)}`;
            window.open(url, "_blank");
        } else if (stepKey === SETUP_STEP_KEYS.STOREFRONT_PREVIEW) {
            window.open(`https://${shopDomain}`, "_blank");
            onComplete(stepKey as SetupStepKey, true);
        } else if (primaryButton?.internalUrl) {
            goTo(primaryButton.internalUrl)();
        }
    };

    const handleSecondaryClick = () => {
        if (secondaryButton?.internalUrl) {
            goTo(secondaryButton.internalUrl)();
        }
    };

    return (
        <s-box paddingBlock="small-200">
            <s-grid
                gridTemplateColumns="1fr auto"
                gap="base"
                padding="small-200"
            >
                <s-checkbox
                    label={title}
                    checked={complete}
                    onChange={completeItem}
                />
                <s-button
                    accessibilityLabel={`Toggle ${title} details`}
                    variant="tertiary"
                    icon={expanded ? "chevron-up" : "chevron-down"}
                    onClick={expanded ? undefined : setExpanded}
                />
            </s-grid>

            <s-box
                padding="small"
                paddingBlockStart="none"
                display={expanded ? "auto" : "none"}
            >
                <s-box
                    padding="base"
                    background="subdued"
                    borderRadius="base"
                >
                    <s-grid
                        gridTemplateColumns={image ? "1fr auto" : "1fr"}
                        gap="base"
                        alignItems="center"
                    >
                        <s-grid gap="small-200">
                            <s-paragraph>{description}</s-paragraph>
                            {(primaryButton || secondaryButton) && (
                                <s-stack direction="inline" gap="small-200">
                                    {primaryButton && (
                                        <s-button
                                            variant="primary"
                                            onClick={handlePrimaryClick}
                                        >
                                            {primaryButton.content}
                                        </s-button>
                                    )}
                                    {secondaryButton && (
                                        <s-button
                                            variant="tertiary"
                                            onClick={handleSecondaryClick}
                                        >
                                            {secondaryButton.content}
                                        </s-button>
                                    )}
                                </s-stack>
                            )}
                        </s-grid>
                        {image && (
                            <s-box maxBlockSize="80px" maxInlineSize="80px">
                                <s-image src={image.url} alt={image.alt} />
                            </s-box>
                        )}
                    </s-grid>
                </s-box>
            </s-box>
        </s-box>
    );
};
