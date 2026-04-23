import { clearLocaleCache } from "@/lib/graphql/operations/locale.operations";

export async function invalidateLocaleCacheService(shop: string): Promise<void> {
    await clearLocaleCache(shop);
}
