"use server";

import { executeGraphQLQuery } from "@/lib/graphql/client/server-action";
import {
    GetShopLocalesDocument,
    GetShopLocalesQuery,
} from "@/lib/graphql/generated/graphql";
import prisma from "@/shared/repositories/prisma-connect";

export interface CachedLocale {
    locale: string;
    name: string;
    primary: boolean;
}

export async function fetchAndCacheShopLocales(
    sessionToken: string,
    domain: string,
): Promise<CachedLocale[]> {
    const response = await executeGraphQLQuery<GetShopLocalesQuery>({
        query: GetShopLocalesDocument,
        sessionToken,
    });

    if (response.errors || !response.data?.shopLocales) {
        console.warn("[Locales] Failed to fetch shopLocales:", response.errors);
        return [];
    }

    const published = response.data.shopLocales
        .filter((l) => l.published)
        .map(({ locale, name, primary }) => ({ locale, name, primary }));

    const primaryLocale = published.find((l) => l.primary)?.locale ?? "en";

    await prisma.shop.update({
        where: { domain },
        data: {
            locales: published,
            primaryLocale,
            localesUpdatedAt: new Date(),
        },
    });

    return published;
}

const LOCALES_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getShopLocales(
    sessionToken: string,
    domain: string,
): Promise<CachedLocale[]> {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { locales: true, primaryLocale: true, localesUpdatedAt: true },
    });

    const isFresh =
        shop?.localesUpdatedAt &&
        Date.now() - new Date(shop.localesUpdatedAt).getTime() < LOCALES_TTL_MS;

    if (
        shop?.locales &&
        Array.isArray(shop.locales) &&
        shop.locales.length > 0 &&
        isFresh
    ) {
        return shop.locales as unknown as CachedLocale[];
    }

    return fetchAndCacheShopLocales(sessionToken, domain);
}

export async function getShopPrimaryLocale(domain: string): Promise<string> {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { primaryLocale: true },
    });

    return shop?.primaryLocale ?? "en";
}
