import { bundleTypeMap } from "@/utils";
import { notFound } from "next/navigation";
import { BundleCreationForm } from "@/bundles/create/[bundleType]/_components/form";

interface Props {
    params: { bundleType: string };
}

export default async function BundleCreationPage({ params }: Props) {
    const { bundleType: bundleTypeParam } = await params;

    const bundleType = bundleTypeMap[bundleTypeParam];

    if (!bundleType) {
        notFound();
    }

    return <BundleCreationForm bundleType={bundleType} />;
}