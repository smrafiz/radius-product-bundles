/**
 * Bundle Scheduler Service
 *
 * Processes scheduled bundle transitions:
 * - SCHEDULED → ACTIVE when startDate arrives
 * - ACTIVE → PAUSED when endDate passes
 * Then syncs metafields so storefront reflects the changes.
 */

import {
    clearMainProductByGid,
    findBundlesReadyToActivate,
    findBundlesReadyToDeactivate,
    findShopsWithPendingTransitions,
    updateBundleStatusById,
} from "@/features/bundles/repositories";
import {
    ProductUpdateDocument,
    ProductUpdateMutation,
} from "@/lib/graphql/generated/graphql";
import {
    findOfflineSessionByShop,
    NoSessionFoundError,
} from "@/shared/repositories/session-storage";
import { syncAllSettingsToMetafields } from "@/lib/graphql/operations";
import { executeGraphQLMutation } from "@/lib/graphql/client/server-action";
import { getShopifyProductStatus, SchedulerResult } from "@/features/bundles";
import { isProductNotFoundError } from "@/features/bundles/services/shopify-operation.service";

async function updateShopifyProductStatus(
    shop: string,
    accessToken: string,
    productId: string,
    bundleStatus: "ACTIVE" | "PAUSED",
) {
    const productStatus = getShopifyProductStatus(bundleStatus);
    const result = await executeGraphQLMutation<ProductUpdateMutation>({
        query: ProductUpdateDocument,
        variables: { id: productId, status: productStatus },
        shop,
        accessToken,
    });
    if (isProductNotFoundError(result)) {
        console.warn(
            `[Scheduler] Product ${productId} no longer exists, clearing reference`,
        );
        await clearMainProductByGid(shop, productId);
        return;
    }

    if (result.errors?.length) {
        console.error(
            `[Scheduler] Product ${productId} status update failed:`,
            result.errors[0].message,
        );
    }
}

export async function processScheduledBundlesForShop(
    shop: string,
    accessToken: string,
): Promise<SchedulerResult> {
    const result: SchedulerResult = {
        processedShops: 0,
        activated: 0,
        deactivated: 0,
        errors: [],
    };

    try {
        const auth = { shop, accessToken };
        let transitioned = false;

        const toActivate = await findBundlesReadyToActivate(shop);
        for (const bundle of toActivate) {
            await updateBundleStatusById(bundle.id, shop, "ACTIVE");
            if (bundle.mainProductId) {
                await updateShopifyProductStatus(
                    shop,
                    accessToken,
                    bundle.mainProductId,
                    "ACTIVE",
                );
            }
            result.activated++;
            transitioned = true;
        }

        const toDeactivate = await findBundlesReadyToDeactivate(shop);
        for (const bundle of toDeactivate) {
            await updateBundleStatusById(bundle.id, shop, "PAUSED");
            if (bundle.mainProductId) {
                await updateShopifyProductStatus(
                    shop,
                    accessToken,
                    bundle.mainProductId,
                    "PAUSED",
                );
            }
            result.deactivated++;
            transitioned = true;
        }

        if (transitioned) {
            const syncResult = await syncAllSettingsToMetafields(auth, shop);
            if (!syncResult.success) {
                result.errors.push({
                    shop,
                    error: `Metafield sync failed: ${syncResult.error}`,
                });
            }
        }

        result.processedShops = 1;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`[Scheduler] Error processing shop ${shop}:`, error);
        result.errors.push({ shop, error: message });
    }

    return result;
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
                let session;
                try {
                    session = await findOfflineSessionByShop(shop);
                } catch (error) {
                    if (error instanceof NoSessionFoundError) {
                        result.errors.push({
                            shop,
                            error: "No offline session found",
                        });
                        continue;
                    }
                    throw error;
                }

                if (!session.accessToken) {
                    result.errors.push({
                        shop,
                        error: "Offline session has no access token",
                    });
                    continue;
                }

                const auth = { shop, accessToken: session.accessToken };
                let transitioned = false;

                // Activate SCHEDULED bundles whose startDate has arrived
                const toActivate = await findBundlesReadyToActivate(shop);

                for (const bundle of toActivate) {
                    await updateBundleStatusById(bundle.id, shop, "ACTIVE");
                    if (bundle.mainProductId) {
                        await updateShopifyProductStatus(
                            shop,
                            session.accessToken,
                            bundle.mainProductId,
                            "ACTIVE",
                        );
                    }
                    console.log(
                        `[Scheduler] Activated bundle ${bundle.id} (${bundle.name}) for ${shop}`,
                    );
                    result.activated++;
                    transitioned = true;
                }

                // Deactivate ACTIVE bundles whose endDate has passed
                const toDeactivate = await findBundlesReadyToDeactivate(shop);

                for (const bundle of toDeactivate) {
                    await updateBundleStatusById(bundle.id, shop, "PAUSED");
                    if (bundle.mainProductId) {
                        await updateShopifyProductStatus(
                            shop,
                            session.accessToken,
                            bundle.mainProductId,
                            "PAUSED",
                        );
                    }
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
                    error instanceof Error ? error.message : "Unknown error";
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
                error instanceof Error ? error.message : "Unknown fatal error",
        });
    }

    console.log(
        `[Scheduler] Complete: ${result.activated} activated, ${result.deactivated} deactivated, ${result.errors.length} errors`,
    );

    return result;
}
