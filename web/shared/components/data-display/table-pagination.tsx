"use client";

import { memo } from "react";
import { TablePaginationProps } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Table pagination component
 */
export const TablePagination = memo(function TablePagination({
    hasPrevious,
    hasNext,
    label,
    onPrevious,
    onNext,
    loading = false,
}: TablePaginationProps) {
    const t = useTranslations("Common");
    return (
        <s-stack
            direction="inline"
            background="subdued"
            padding="small"
            gap="small-200"
            alignItems="center"
            justifyContent="center"
            borderRadius="base base large large"
        >
            <s-button
                variant="secondary"
                disabled={!hasPrevious || loading}
                onClick={onPrevious}
                icon="caret-left"
                accessibilityLabel={t("previousPage")}
            />

            <s-text color="subdued">{label}</s-text>

            <s-button
                variant="secondary"
                disabled={!hasNext || loading}
                onClick={onNext}
                icon="caret-right"
                accessibilityLabel={t("nextPage")}
            />
        </s-stack>
    );
});
