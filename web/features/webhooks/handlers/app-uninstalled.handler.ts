import { deleteShopData } from "@/features/webhooks";
import { AppInstallations } from "@/shared/repositories";

export async function handleAppUninstalled(
    shop: string,
    body: string,
): Promise<void> {
    console.log(`[App Uninstall] Processing uninstall for ${shop}`);

    try {
        await deleteShopData(shop);
        await AppInstallations.delete(shop);
        console.log(`[App Uninstall] Cleanup complete for ${shop}`);
    } catch (error) {
        console.error(`[App Uninstall] Error:`, error);
    }
}
