"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Tooltip } from "@shopify/polaris";

import { BundleListItem } from "@/types";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";

interface Props {
    bundle: BundleListItem;
}

export default function BundleActionsGroup({ bundle }: Props) {
    const router = useRouter();

    const handleActionClick = (actionKey: string, bundle: BundleListItem) => {
        switch (actionKey) {
            case "edit":
                router.push(`/bundles/${bundle.id}/edit`);
                break;
            case "view":
                window.open(`/bundles/${bundle.id}/preview`, '_blank');
                break;
            case "duplicate":
                onDuplicate ? onDuplicate(bundle) : console.log("Duplicate", bundle.id);
                break;
            case "delete":
                onDelete ? onDelete(bundle) : console.log("Delete", bundle.id);
                break;
            default:
                console.warn(`Unknown action: ${actionKey}`);
        }
    };

    return (
        <ButtonGroup variant="segmented">
            {LISTING_DEFAULT_ACTIONS.map((action, index) => (
                <Tooltip key={index} content={action.tooltip}>
                    <Button
                        icon={action.icon}
                        tone={action.tone}
                        disabled={action.disabled}
                        onClick={() => handleActionClick(action.key, bundle)}
                        accessibilityLabel={action.tooltip}
                    />
                </Tooltip>
            ))}
        </ButtonGroup>
    );
}