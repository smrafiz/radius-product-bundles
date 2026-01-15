/*
 * Table Header
 */
export function TopBundlesTableHeader() {
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">Bundle</s-table-header>
            <s-table-header listSlot="inline">Assessment</s-table-header>
            <s-table-header listSlot="labeled">Revenue + AOV</s-table-header>
            <s-table-header listSlot="labeled">Orders</s-table-header>
            <s-table-header listSlot="labeled">Views</s-table-header>
            <s-table-header listSlot="labeled">Conversion</s-table-header>
        </s-table-header-row>
    );
}
