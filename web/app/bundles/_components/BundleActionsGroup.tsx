"use client";

import { Button, ButtonGroup, Tooltip } from "@shopify/polaris";
import {
    EditIcon,
    DuplicateIcon,
    DeleteIcon,
    ViewIcon
} from "@shopify/polaris-icons";
import { BundleListItem } from "@/types";

interface BundleAction {
    icon: React.ComponentType<any>;
    tooltip: string;
    onClick: (bundle: BundleListItem) => void;
    tone?: "success" | "critical" | "base";
    disabled?: boolean;
}

interface Props {
    bundle: BundleListItem;
    actions?: BundleAction[];
}

export default function BundleActionsGroup({ bundle, actions }: Props) {
    // Default actions if none provided
    const defaultActions: BundleAction[] = [
        {
            icon: EditIcon,
            tooltip: "Edit bundle",
            onClick: (bundle) => console.log("Edit", bundle.id),
        },
        {
            icon: ViewIcon,
            tooltip: "View bundle",
            onClick: (bundle) => console.log("View", bundle.id),
        },
        {
            icon: DuplicateIcon,
            tooltip: "Duplicate bundle",
            onClick: (bundle) => console.log("Duplicate", bundle.id),
        },
        {
            icon: DeleteIcon,
            tooltip: "Delete bundle",
            onClick: (bundle) => console.log("Delete", bundle.id),
            tone: "critical",
        },
    ];

    const actionsToRender = actions || defaultActions;

    return (
        <ButtonGroup variant="segmented">
            {actionsToRender.map((action, index) => (
                <Tooltip key={index} content={action.tooltip}>
                    <Button
                        icon={action.icon}
                        tone={action.tone}
                        disabled={action.disabled}
                        onClick={() => action.onClick(bundle)}
                        accessibilityLabel={action.tooltip}
                    />
                </Tooltip>
            ))}
        </ButtonGroup>
    );
}