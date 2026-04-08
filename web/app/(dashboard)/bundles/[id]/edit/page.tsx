import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaticTranslations } from "@/lib/i18n/server";
import { getShopSubscription } from "@/shared/repositories";
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

    const { exists, isDeleted, type } = await checkBundleExists(params.id, shop);

    if (shop && (!exists || isDeleted)) {
        return <BundleRedirect to="/bundles" />;
    }

    const devUnlock = process.env.NEXT_PUBLIC_UNLOCK_ALL_FEATURES === "true";

    // Pro gate: VOLUME_DISCOUNT bundles require Pro plan
    if (type === "VOLUME_DISCOUNT" && !devUnlock) {
        if (shop) {
            const subscription = await getShopSubscription(shop);
            if (!subscription || subscription.plan === "FREE") {
                redirect("/pricing");
            }
        }
        // If no shop param, client-side plan gating handles restriction
    }

    return <EditBundlePage params={params} />;
}
