import { memo } from "react";

/*
 * Bundle bulk actions popover components
 */
export const BundleBulkActionsPopover = memo(function BundleBulkActionsPopover({
    actions,
}: {
    actions: Array<{
        content: string;
        icon?: "duplicate" | "delete";
        destructive?: boolean;
        onAction?: () => void;
    }>;
}) {
    return (
        <s-stack direction="inline">
            <s-button
                variant="secondary"
                commandFor="bulk-actions-popover"
                icon="menu-horizontal"
                accessibilityLabel="More actions"
            />
            <s-popover id="bulk-actions-popover">
                <s-box padding="small">
                    <s-stack gap="small-300">
                        {actions.map((action, index) => (
                            <s-button
                                key={index}
                                icon={action.icon}
                                variant="tertiary"
                                tone={action.destructive ? "critical" : "auto"}
                                onClick={action.onAction}
                            >
                                {action.content}
                            </s-button>
                        ))}
                    </s-stack>
                </s-box>
            </s-popover>
        </s-stack>
    );
});
