"use client";

import { useState } from "react";
import { useAppNavigation } from "@/shared";
import { SetupItemProps, SetupStepKey } from "@/features/dashboard";
import { SETUP_STEP_KEYS } from "@/features/dashboard/constants/setup-guide.constants";

export const DashboardSetupItem = ({
    complete,
    autoDetected,
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
    const [btnLoading, setBtnLoading] = useState<
        "primary" | "secondary" | null
    >(null);
    const { goTo } = useAppNavigation();
    const isDisabled = autoDetected && complete;

    const completeItem = async () => {
        if (isDisabled) {
            return;
        }

        setLoading(true);
        await onComplete(stepKey as SetupStepKey, !complete);
        setLoading(false);
    };

    const handlePrimaryClick = async () => {
        setBtnLoading("primary");
        if (stepKey === SETUP_STEP_KEYS.APP_EMBED) {
            const url = `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`;
            window.open(url, "_blank");
            setBtnLoading(null);
        } else if (stepKey === SETUP_STEP_KEYS.STOREFRONT_PREVIEW) {
            window.open(`https://${shopDomain}`, "_blank");
            await onComplete(stepKey as SetupStepKey, true);
            setBtnLoading(null);
        } else if (primaryButton?.internalUrl) {
            goTo(primaryButton.internalUrl)();
        }
    };

    const handleSecondaryClick = async () => {
        setBtnLoading("secondary");
        if (stepKey === SETUP_STEP_KEYS.APP_EMBED) {
            const extensions = await shopify.app.extensions();
            const themeExt = extensions.find(
                (e) => e.type === "theme_app_extension",
            );
            const activations = (themeExt?.activations ?? []) as Array<{
                handle: string;
                target: string;
                status: string;
            }>;
            const embedActive = activations.some(
                (a) =>
                    a.handle === "app-embed" &&
                    a.target !== "section" &&
                    a.status === "active",
            );
            if (embedActive) {
                await onComplete(stepKey as SetupStepKey, true);
                shopify.toast.show("App embed is active");
            } else {
                if (complete) {
                    await onComplete(stepKey as SetupStepKey, false);
                }
                shopify.toast.show("App embed is not enabled yet", {
                    isError: true,
                });
            }
        } else if (secondaryButton?.internalUrl) {
            goTo(secondaryButton.internalUrl)();
        }
        setBtnLoading(null);
    };

    return (
        <s-box paddingBlock="small-200">
            <s-grid
                gridTemplateColumns="1fr auto"
                gap="base"
                padding="small-200"
            >
                <div className="flex items-center gap-2 min-h-8">
                    {loading ? (
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
                            onChange={completeItem}
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
                    <s-box padding="small" paddingBlockStart="none">
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
                                                    onClick={handlePrimaryClick}
                                                    loading={
                                                        btnLoading ===
                                                        "primary"
                                                    }
                                                    disabled={
                                                        btnLoading !== null
                                                    }
                                                >
                                                    {primaryButton.content}
                                                </s-button>
                                            )}
                                            {secondaryButton && (
                                                <s-button
                                                    variant="tertiary"
                                                    onClick={
                                                        handleSecondaryClick
                                                    }
                                                    loading={
                                                        btnLoading ===
                                                        "secondary"
                                                    }
                                                    disabled={
                                                        btnLoading !== null
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
