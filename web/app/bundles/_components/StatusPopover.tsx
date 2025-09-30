"use client";

import { getStatusBadge } from "@/utils";
import { useCallback, useState } from "react";
import { bundleStatusConfigs } from "@/config";
import { BundleListItem, BundleStatus } from "@/types";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import {
    ActionList,
    Badge,
    Button,
    Icon,
    InlineStack,
    Link,
    Modal,
    Popover,
    Text,
} from "@shopify/polaris";

import { useBundleListingStore } from "@/stores";

interface Props {
    bundle: BundleListItem;
    onStatusUpdate?: (status: BundleStatus) => Promise<void>;
}

export default function StatusPopover({ bundle, onStatusUpdate }: Props) {
    const [popoverActive, setPopoverActive] = useState(false);
    const [confirmActive, setConfirmActive] = useState(false);
    const [newStatus, setNewStatus] = useState<BundleStatus | null>(null);
    const [updating, setUpdating] = useState(false);

    const showToast = useBundleListingStore((s) => s.showToast);

    const togglePopover = useCallback(
        () => setPopoverActive((active) => !active),
        [],
    );
    const toggleConfirm = useCallback(
        () => setConfirmActive((active) => !active),
        [],
    );

    const handleStatusClick = (status: BundleStatus) => {
        if (status !== bundle.status) {
            setNewStatus(status);
            setConfirmActive(true);
        }
        setPopoverActive(false);
    };

    const handleConfirm = async () => {
        if (!newStatus) return;

        try {
            setUpdating(true);
            if (onStatusUpdate) {
                await onStatusUpdate(newStatus);
            }
            showToast(
                `Bundle "${bundle.name}" status updated to ${
                    bundleStatusConfigs[newStatus].text
                }`,
            );
        } catch {
            showToast("Failed to update bundle status");
        } finally {
            setUpdating(false);
            setNewStatus(null);
            setConfirmActive(false);
        }
    };

    const badge = getStatusBadge(bundle.status);

    const activator = (
        <Link onClick={togglePopover} monochrome removeUnderline>
            <InlineStack align="center">
                <Badge tone={badge.tone as any}>
                    {badge.text}
                </Badge>
                <Icon
                    source={popoverActive ? ChevronUpIcon : ChevronDownIcon}
                />
            </InlineStack>
        </Link>
    );

    return (
        <>
            <Popover active={popoverActive} activator={activator} onClose={togglePopover}>
                <ActionList
                    items={Object.entries(bundleStatusConfigs).map(([statusKey, status]) => ({
                        content: status.text,
                        onAction: () => handleStatusClick(statusKey as BundleStatus),
                    }))}
                />
            </Popover>

            <Modal
                open={confirmActive}
                onClose={toggleConfirm}
                title="Confirm Status Change"
                primaryAction={{
                    content: "Confirm",
                    loading: updating,
                    onAction: handleConfirm,
                }}
                secondaryActions={[{ content: "Cancel", onAction: toggleConfirm }]}
            >
                <Modal.Section>
                    <Text as="p" variant="bodyMd">
                        Are you sure you want to change the <strong>{bundle.name}</strong> status
                        to <strong>{newStatus ? bundleStatusConfigs[newStatus].text : ""}</strong>?
                    </Text>
                </Modal.Section>
            </Modal>
        </>
    );
}