import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { checkBundleExists } from "@/features/bundles/services";
import { EditBundlePage, BundleRedirect } from "@/features/bundles";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.bundleEdit");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function EditBundleByIdPage(props: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ shop?: string }>;
}) {
    const [params, searchParams] = await Promise.all([
        props.params,
        props.searchParams,
    ]);
    const shop = searchParams?.shop ?? "";

    const { exists, isDeleted } = await checkBundleExists(params.id, shop);

    if (shop && (!exists || isDeleted)) {
        return <BundleRedirect to="/bundles" />;
    }

    return <EditBundlePage params={params} />;
}
