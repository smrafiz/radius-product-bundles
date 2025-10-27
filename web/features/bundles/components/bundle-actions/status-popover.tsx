"use client";

import {
    ActionList,
    Badge,
    Icon,
    InlineStack,
    Link,
    Popover,
} from "@shopify/polaris";
import {
    BUNDLE_STATUSES,
    BundleStatus,
    getBundleStatusBadge,
    StatusPopoverProps,
    useBundleActions,
} from "@/features/bundles";
import { useModalStore } from "@/shared";
import { useCallback, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

/**
 * Bundle status popover
 */
export function StatusPopover({ bundle }: StatusPopoverProps) {
    const [popoverActive, setPopoverActive] = useState(false);

    const { openModal } = useModalStore();
    const { actions } = useBundleActions(bundle);

    const togglePopover = useCallback(
        () => setPopoverActive((active) => !active),
        [],
    );

    const handleStatusClick = (status: BundleStatus) => {
        if (status !== bundle.status) {
            openModal({
                type: "status",
                bundle,
                newStatus: status,
                onConfirm: async () => {
                    await actions.status(status);
                },
            });
        }
        setPopoverActive(false);
    };

    const badge = getBundleStatusBadge(bundle.status);

    const activator = (
        <Link onClick={togglePopover} monochrome removeUnderline>
            <InlineStack align="center">
                <Badge tone={badge.tone as any}>{badge.text}</Badge>
                <Icon
                    source={popoverActive ? ChevronUpIcon : ChevronDownIcon}
                />
            </InlineStack>
        </Link>
    );

    return (
        <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopover}
        >
            <ActionList
                items={Object.entries(BUNDLE_STATUSES).map(
                    ([statusKey, status]) => ({
                        content: status.text,
                        onAction: () =>
                            handleStatusClick(statusKey as BundleStatus),
                    }),
                )}
            />
        </Popover>
    );
}
