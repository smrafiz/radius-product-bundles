import { deleteShopData } from "@/features/webhooks";
import { AppInstallations } from "@/shared/repositories";

/**
 * Handle APP_UNINSTALLED webhook
 *
 * Clean up all data when the app is uninstalled
 */
export async function handleAppUninstalled(
    shop: string,
    body: string,
): Promise<void> {
    console.log(`[App Uninstall Handler] 🗑️ Processing uninstall for ${shop}`);

    try {
        // Delete all shop data from the database
        await deleteShopData(shop);

        // Legacy cleanup
        await AppInstallations.delete(shop);

        console.log(`[App Uninstall Handler] ✅ Cleanup complete for ${shop}`);
    } catch (error) {
        console.error(`[App Uninstall Handler] ❌ Error:`, error);
        // Don't throw - webhook should still return 200
    }
}
