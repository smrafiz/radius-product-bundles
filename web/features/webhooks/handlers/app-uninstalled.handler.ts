import { deleteShopData } from "@/features/webhooks";
import { AppInstallations } from "@/shared/repositories";

export async function handleAppUninstalled(
    shop: string,
    body: string,
): Promise<void> {
    try {
        await deleteShopData(shop);
        await AppInstallations.delete(shop);
    } catch (error) {
        console.error(`[App Uninstall] Error:`, error);
        throw error;
    }
}
