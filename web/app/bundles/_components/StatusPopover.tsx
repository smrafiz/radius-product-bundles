"use client";

import { useCallback, useState } from "react";
import { ActionList, Badge, Icon, InlineStack, Link, Modal, Popover, Text, } from "@shopify/polaris";
import { BundleListItem, BundleStatus } from "@/types";
import { getStatusBadge } from "@/utils";
import { bundleStatusConfigs } from "@/config";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
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

    const refreshBundles = useBundleListingStore((s) => s.refreshBundles);
    const pagination = useBundleListingStore((s) => s.pagination);
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
            toggleConfirm();
        }
        setPopoverActive(false);
    };

    const handleConfirm = async () => {
        if (!newStatus) {
            return;
        }

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
        } catch (err) {
            showToast("Failed to update bundle status");
        } finally {
            setUpdating(false);
            toggleConfirm();
        }
    };

    const activator = (
        <Link onClick={togglePopover} monochrome removeUnderline>
            <InlineStack align="center">
                <Badge tone={getStatusBadge(bundle.status).tone as any}>
                    {getStatusBadge(bundle.status).text}
                </Badge>
                <Icon
                    source={popoverActive ? ChevronUpIcon : ChevronDownIcon}
                />
            </InlineStack>
        </Link>
    );

    return (
        <>
            <Popover
                active={popoverActive}
                activator={activator}
                onClose={togglePopover}
            >
                <div className="bg-transparent shadow-none border-0 p-0">
                    <ActionList
                        items={Object.entries(bundleStatusConfigs ?? {}).map(
                            ([statusKey, status]) => ({
                                content: status.text,
                                onAction: () =>
                                    handleStatusClick(
                                        statusKey as BundleStatus,
                                    ),
                            }),
                        )}
                    />
                </div>
            </Popover>

            <Modal
                open={confirmActive}
                onClose={toggleConfirm}
                title="Confirm Status Change"
                primaryAction={{
                    content: updating ? undefined : "Confirm",
                    loading: updating,
                    onAction: handleConfirm,
                }}
                secondaryActions={[
                    { content: "Cancel", onAction: toggleConfirm },
                ]}
            >
                <Modal.Section>
                    <Text as="p" variant="bodyMd">
                        Are you sure you want to change the <strong>{bundle.name}</strong> status to{" "}
                        <strong>
                            {newStatus
                                ? bundleStatusConfigs[newStatus].text
                                : ""}
                        </strong>
                        ?
                    </Text>
                </Modal.Section>
            </Modal>
        </>
    );
}
