"use client";

import { useState } from "react";
import { ANALYTICS_ORDER_BUNDLE } from "@/features/analytics";

export const AnalyticsOrderBundlesList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // ===== FILTER =====
    const filteredData = ANALYTICS_ORDER_BUNDLE.filter((bundle) =>
        bundle.item.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ===== PAGINATION =====
    const itemsPerPage = 5;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / itemsPerPage),
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return (
        <s-stack>
            {/* ===== TABLE ===== */}
            <s-table>
                <s-grid
                    slot="filters"
                    gap="small-200"
                    gridTemplateColumns="1fr auto"
                >
                    <s-search-field
                        label="Search"
                        labelAccessibilityVisibility="exclusive"
                        placeholder="Search items"
                        value={searchTerm}
                        onInput={(e: any) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </s-grid>

                <s-table-header-row>
                    <s-table-header listSlot="primary">Order</s-table-header>
                    <s-table-header>Order date</s-table-header>
                    <s-table-header>Items</s-table-header>
                    <s-table-header>Bundle's total sales</s-table-header>
                    <s-table-header>Order's total sales</s-table-header>
                </s-table-header-row>

                <s-table-body>
                    {currentData.map((bundle, index) => (
                        <s-table-row key={index}>
                            <s-table-cell>#{bundle.order}</s-table-cell>
                            <s-table-cell>{bundle.order_date}</s-table-cell>
                            <s-table-cell>{bundle.item}</s-table-cell>
                            <s-table-cell>{bundle.bundle_total}</s-table-cell>
                            <s-table-cell>{bundle.order_total}</s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>

            {/* ===== PAGINATION CONTROLS ===== */}
            <s-stack
                direction="inline"
                gap="small"
                justifyContent="space-between"
                padding="base"
            >
                <s-button
                    variant="secondary"
                    disabled={!hasPreviousPage}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                    Previous
                </s-button>

                <s-text>
                    Page {currentPage} of {totalPages}
                </s-text>

                <s-button
                    variant="secondary"
                    disabled={!hasNextPage}
                    onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                >
                    Next
                </s-button>
            </s-stack>
        </s-stack>
    );
};
