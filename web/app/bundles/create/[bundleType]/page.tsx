import type { BundleType } from "@/types";
import { notFound } from "next/navigation";
import BundleCreationForm from "@/app/bundles/create/[bundleType]/_components/BundleCreationForm";

interface Props {
    params: { bundleType: string };
}

// Map URL params to Prisma enum values
const bundleTypeMap: Record<string, BundleType> = {
    "buy-x-get-y": "BUY_X_GET_Y",
    "bogo": "BOGO",
    "volume-discount": "VOLUME_DISCOUNT",
    "mix-match": "MIX_MATCH",
    "cross-sell": "CROSS_SELL",
    "fixed-bundle": "FIXED_BUNDLE",
};

export default function BundleCreationPage({ params }: Props) {
    // Convert URL param to enum value
    const bundleType = bundleTypeMap[params.bundleType];

    // Validate bundle type
    if (!bundleType) {
        notFound();
    }

    return <BundleCreationForm bundleType={bundleType} />;
}
