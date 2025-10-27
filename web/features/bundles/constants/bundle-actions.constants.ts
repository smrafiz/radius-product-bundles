/*
 * Bundle actions constants
 */

import {
    DeleteIcon,
    DuplicateIcon,
    EditIcon,
    ViewIcon,
} from "@shopify/polaris-icons";
import { BundleAction } from "@/features/bundles";

/**
 * Bundle listing actions
 */
export const BUNDLE_LISTING_ACTIONS: BundleAction[] = [
    {
        key: "edit",
        icon: EditIcon,
        tooltip: "Edit bundle",
    },
    {
        key: "view",
        icon: ViewIcon,
        tooltip: "View bundle",
    },
    {
        key: "duplicate",
        icon: DuplicateIcon,
        tooltip: "Duplicate bundle",
    },
    {
        key: "delete",
        icon: DeleteIcon,
        tooltip: "Delete bundle",
        tone: "critical",
    },
];