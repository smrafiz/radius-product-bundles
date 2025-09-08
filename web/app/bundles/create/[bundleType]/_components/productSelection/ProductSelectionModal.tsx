"use client";

import { useEffect, useRef, useCallback } from "react";
import {
    Modal,
    Button,
    Select,
    TextField,
    InlineStack,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { SelectedItem } from "@/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProductsSelected: (items: SelectedItem[]) => void;
    selectedProductIds: string[];
    title?: string;
    collectionId?: string;
}

export function ProductSelectionModal({
    isOpen,
    onClose,
    onProductsSelected,
    selectedProductIds,
    title = "Add products",
    collectionId,
}: Props) {
    const app = useAppBridge();

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchInput, setSearchInput] = useState("");

    const openResourcePicker = useCallback(async () => {
        if (!app) return;

        try {
            const queryParts = [];

            // Status filter
            if (statusFilter === "ALL") {
                queryParts.push("status:ACTIVE,DRAFT,ARCHIVED");
            } else {
                queryParts.push(`status:${statusFilter}`);
            }

            // Search input
            if (searchInput.trim()) {
                queryParts.push(`*${searchInput.trim()}*`);
            }

            // Collection filter
            if (collectionId) {
                queryParts.push(`collection_id:${collectionId}`);
            }

            const queryString = queryParts.join(" ");

            const result = await app.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: selectedProductIds,
                query: queryString,
            });

            if (!result || !result.selection) return;

            const selected: SelectedItem[] = result.selection.map((p: any) => ({
                productId: p.id,
                title: p.title,
                variants: p.variants.map((v: any) => ({
                    variantId: v.id,
                    title: v.title,
                    sku: v.sku,
                    price: v.price,
                })),
            }));

            onProductsSelected(selected);
            onClose();
        } catch (err) {
            console.error("Resource picker error:", err);
        }
    }, [
        app,
        statusFilter,
        searchInput,
        collectionId,
        selectedProductIds,
        onProductsSelected,
        onClose,
    ]);

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={title}
            primaryAction={{
                content: "Open Shopify Picker",
                onAction: openResourcePicker,
            }}
            secondaryActions={[{ content: "Cancel", onAction: onClose }]}
        >
            <Modal.Section>
                <InlineStack gap="4">
                    <Select
                        label="Status"
                        options={[
                            { label: "All", value: "ALL" },
                            { label: "Active", value: "ACTIVE" },
                            { label: "Draft", value: "DRAFT" },
                            { label: "Archived", value: "ARCHIVED" },
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                    <TextField
                        label="Search"
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Search by title, SKU, or barcode"
                    />
                </InlineStack>
            </Modal.Section>
        </Modal>
    );
}
