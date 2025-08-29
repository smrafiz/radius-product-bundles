import type { BundleType } from "@/types";
import { notFound } from "next/navigation";
import BundleCreationForm from "@/app/bundles/create/[bundleType]/_components/form";

interface Props {
    params: { bundleType: string };
}

const bundleTypeMap: Record<string, BundleType> = {
    "buy-x-get-y": "BUY_X_GET_Y",
    "bogo": "BOGO",
    "volume-discount": "VOLUME_DISCOUNT",
    "mix-match": "MIX_MATCH",
    "cross-sell": "CROSS_SELL",
    "fixed-bundle": "FIXED_BUNDLE",
};

export default async function BundleCreationPage({ params }: Props) {
    const { bundleType: bundleTypeParam } = await params;

    const bundleType = bundleTypeMap[bundleTypeParam];

    if (!bundleType) {
        notFound();
    }

    return <BundleCreationForm bundleType={bundleType} />;
}