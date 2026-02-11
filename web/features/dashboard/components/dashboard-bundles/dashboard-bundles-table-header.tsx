/*
 * Table Header
 */
export function DashboardBundlesTableHeader() {
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">Item</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Name</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Type</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Views</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Conversion</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Revenue</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">Status</s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
