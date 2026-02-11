/*
 * Table Header
 */

import { SortHeaderProps, useBundleSort } from "@/features/analytics";

function SortHeader({
    field,
    label,
    currentSort,
    currentOrder,
    onSort,
    format,
    listSlot = "labeled",
}: SortHeaderProps) {
    const isActive = currentSort === field;
    const icon = isActive ? (currentOrder === "desc" ? "↓" : "↑") : "";

    return (
        <s-table-header listSlot={listSlot} format={format}>
            <div className="-ml-3">
                <s-button variant="tertiary" onClick={() => onSort(field)}>
                    <span
                        style={{
                            borderBottom:
                                ".125rem dotted #cccccc",
                            cursor: "n-resize",
                            display: "inline-block",
                        }}
                    >
                        {label} {icon}
                    </span>
                </s-button>
            </div>
        </s-table-header>
    );
}

export function AllBundlesTableHeader() {
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">
                    Bundle
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="inline">
                <s-stack paddingBlock="small-300">
                    Status
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Revenue
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Orders
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Views
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Cart %
                </s-stack>{" "}
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Conv %
                </s-stack>{" "}
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Funnel
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Health
                </s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
