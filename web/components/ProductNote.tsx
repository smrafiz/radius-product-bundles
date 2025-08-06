import {
    TextField,
    Select,
    Button,
    InlineStack,
    BlockStack,
    Box,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { RedDeleteIcon } from "@/components/RedDeleteIcon";
import { deleteProductNote } from "@/actions/notes.action";
import { useState } from "react";

export interface ProductNoteRow {
    productId: string;
    note: string;
}

interface Props {
    products: { label: string; value: string }[];
    value: ProductNoteRow[];
    onChange: (rows: ProductNoteRow[]) => void;
    sessionToken: string;
    productsLoading?: boolean;
}

const initialRow = { productId: "", note: "" };

export default function ProductNoteRepeater({
    products,
    value,
    onChange,
    sessionToken,
    productsLoading = false,
}: Props) {
    // Track deleting row indexes
    const [deletingRows, setDeletingRows] = useState<Set<number>>(new Set());

    const handleChange = (
        index: number,
        key: "productId" | "note",
        newVal: string,
    ) => {
        const updated = [...value];
        updated[index][key] = newVal;
        onChange(updated);
    };

    const addRow = () => onChange([...value, { ...initialRow }]);

    const removeRow = async (index: number) => {
        // Mark row as deleting
        setDeletingRows((prev) => new Set(prev).add(index));

        const productId = value[index].productId;

        if (productId) {
            const res = await deleteProductNote(productId, sessionToken);
            if (!res.success) {
                console.error("Error deleting from DB:", res.error);
                // Remove loading state on error
                setDeletingRows((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(index);
                    return newSet;
                });
                return;
            }
        }

        // Remove row locally
        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated);

        // Remove loading state
        setDeletingRows((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    };

    return (
        <BlockStack gap="300">
            {value.map((row, index) => {
                const isDeleting = deletingRows.has(index);

                return (
                    <InlineStack
                        key={index}
                        gap="200"
                        wrap={false}
                        align="center"
                    >
                        <Box width="25%">
                            <Select
                                label="Product"
                                options={
                                    productsLoading
                                        ? [
                                              {
                                                  label: "Loading products...",
                                                  value: "",
                                              },
                                          ]
                                        : products
                                }
                                value={row.productId}
                                onChange={(value) =>
                                    handleChange(index, "productId", value)
                                }
                                disabled={productsLoading || isDeleting}
                            />
                        </Box>
                        <Box width="50%">
                            <TextField
                                label="Note"
                                value={row.note}
                                onChange={(value) =>
                                    handleChange(index, "note", value)
                                }
                                autoComplete="off"
                                disabled={isDeleting}
                            />
                        </Box>
                        <Box>
                            <div className="flex items-center relative top-[12px] h-full">
                                <Button
                                    onClick={() => removeRow(index)}
                                    icon={RedDeleteIcon}
                                    variant="tertiary"
                                    accessibilityLabel="Remove note"
                                    disabled={value.length === 1 || isDeleting}
                                />
                            </div>
                        </Box>
                    </InlineStack>
                );
            })}
            <InlineStack
                align="center"
                blockAlign="center"
                gap="200"
                wrap={false}
            >
                <Box>
                    <Button onClick={addRow} icon={PlusIcon} size="slim">
                        Add another note
                    </Button>
                </Box>
            </InlineStack>
        </BlockStack>
    );
}
