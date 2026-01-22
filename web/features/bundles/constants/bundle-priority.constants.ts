import type { BundlePriorityInfo } from "@/features/bundles";

export const BUNDLE_PRIORITY: BundlePriorityInfo[] = [
    {
        id: "index_based",
        title: "Index based",
        description: "Display the bundle given as a number priority",
    },
    {
        id: "discount_based",
        title: "Discount based",
        description: "Display the bundle with the highest discount",
    },
];
