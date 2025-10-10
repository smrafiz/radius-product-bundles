"use client";

import { useCallback, useState } from "react";
import { bundleStatusConfigs } from "@/config";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import {
    ActionList,
    Badge,
    Icon,
    InlineStack,
    Link,
    Popover,
} from "@shopify/polaris";
import {
    BundleListItem,
    BundleStatus,
    useBundleActions,
} from "@/features/bundles";
import { useModalStore } from "@/stores";
import { getStatusBadge } from "@/utils";


interface Props {
    bundle: BundleListItem;
    onStatusUpdate?: (status: BundleStatus) => Promise<void>;
}

export function StatusPopover({ bundle, onStatusUpdate }: Props) {
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

    const badge = getStatusBadge(bundle.status);

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
                items={Object.entries(bundleStatusConfigs).map(
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
