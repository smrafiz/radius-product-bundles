/*
 * Table Header
 */
export function TopBundlesTableHeader() {
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Bundle
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="inline">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Assessment
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="labeled">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Revenue + AOV
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="labeled">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Orders
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="labeled">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Views
                </s-stack>
            </s-table-header>
            <s-table-header listSlot="labeled">
                <s-stack paddingInline="none" paddingBlock="small-400">
                    Conversion
                </s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
