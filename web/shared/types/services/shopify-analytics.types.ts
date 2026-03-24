export interface ShopifyQLTableData {
    columns: ShopifyQlColumn[];
    rows: Record<string, unknown>[];
}

export interface ShopifyQlColumn {
    name: string;
    dataType: string;
    displayName: string;
}

export interface ShopifyQLResponse {
    tableData?: ShopifyQLTableData;
    parseErrors: unknown[];
}

export interface DateRange {
    from: Date;
    to: Date;
}
