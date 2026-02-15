/**
 * Bundle Scheduler Service
 *
 * Processes scheduled bundle transitions:
 * - SCHEDULED → ACTIVE when startDate arrives
 * - ACTIVE → PAUSED when endDate passes
 * Then syncs metafields so storefront reflects the changes.
 */

import {
    findShopsWithPendingTransitions,
    findBundlesReadyToActivate,
    findBundlesReadyToDeactivate,
    updateBundleStatusById,
} from "@/features/bundles/repositories";
import { findOfflineSessionByShop } from "@/shared/repositories/session-storage";
import { syncAllSettingsToMetafields } from "@/lib/graphql/operations";

export interface SchedulerResult {
    processedShops: number;
    activated: number;
    deactivated: number;
    errors: Array<{ shop: string; error: string }>;
}

export async function processScheduledBundles(): Promise<SchedulerResult> {
    const result: SchedulerResult = {
        processedShops: 0,
        activated: 0,
        deactivated: 0,
        errors: [],
    };

    try {
        const shops = await findShopsWithPendingTransitions();

        if (shops.length === 0) {
            return result;
        }

        console.log(
            `[Scheduler] Found ${shops.length} shop(s) with pending transitions`,
        );

        for (const shop of shops) {
            try {
                // Get offline access token for this shop
                const session = await findOfflineSessionByShop(shop);
                if (!session?.accessToken) {
                    result.errors.push({
                        shop,
                        error: "No offline access token found",
                    });
                    continue;
                }

                const auth = { shop, accessToken: session.accessToken };
                let transitioned = false;

                // Activate SCHEDULED bundles whose startDate has arrived
                const toActivate = (
                    await findBundlesReadyToActivate()
                ).filter((b) => b.shop === shop);

                for (const bundle of toActivate) {
                    await updateBundleStatusById(bundle.id, shop, "ACTIVE");
                    console.log(
                        `[Scheduler] Activated bundle ${bundle.id} (${bundle.name}) for ${shop}`,
                    );
                    result.activated++;
                    transitioned = true;
                }

                // Deactivate ACTIVE bundles whose endDate has passed
                const toDeactivate = (
                    await findBundlesReadyToDeactivate()
                ).filter((b) => b.shop === shop);

                for (const bundle of toDeactivate) {
                    await updateBundleStatusById(bundle.id, shop, "PAUSED");
                    console.log(
                        `[Scheduler] Paused expired bundle ${bundle.id} (${bundle.name}) for ${shop}`,
                    );
                    result.deactivated++;
                    transitioned = true;
                }

                // Sync metafields if any transitions occurred
                if (transitioned) {
                    const syncResult = await syncAllSettingsToMetafields(
                        auth,
                        shop,
                    );
                    if (!syncResult.success) {
                        console.error(
                            `[Scheduler] Metafield sync failed for ${shop}:`,
                            syncResult.error,
                        );
                        result.errors.push({
                            shop,
                            error: `Metafield sync failed: ${syncResult.error}`,
                        });
                    }
                }

                result.processedShops++;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown error";
                console.error(
                    `[Scheduler] Error processing shop ${shop}:`,
                    error,
                );
                result.errors.push({ shop, error: message });
            }
        }
    } catch (error) {
        console.error("[Scheduler] Fatal error:", error);
        result.errors.push({
            shop: "global",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown fatal error",
        });
    }

    console.log(
        `[Scheduler] Complete: ${result.activated} activated, ${result.deactivated} deactivated, ${result.errors.length} errors`,
    );

    return result;
}
