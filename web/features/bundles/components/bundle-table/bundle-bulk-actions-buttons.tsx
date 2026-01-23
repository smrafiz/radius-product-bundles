import { memo } from "react";

/*
 * Bundle bulk actions buttons components
 */
export const BundleBulkActionsButtons = memo(function BundleBulkActionsButtons({
    actions,
}: {
    actions: Array<{ content: string; onAction?: () => void }>;
}) {
    return (
        <>
            {actions.map((action, index) => (
                <s-button
                    key={index}
                    variant="secondary"
                    onClick={action.onAction}
                >
                    {action.content}
                </s-button>
            ))}
        </>
    );
});
