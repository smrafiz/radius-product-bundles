/*
 * Table Header
 */
export function TopBundlesTableHeader() {
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">
                    Bundle
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="inline">
                <s-stack paddingBlock="small-300">
                    Assessment
                </s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">
                    Revenue + AOV
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
                    Conversion
                </s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
