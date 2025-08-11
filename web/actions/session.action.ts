"use server";
import { handleSessionToken } from "@/lib/shopify/verify";

/**
 * Store the session (and access token) in the database
 */
export async function storeToken(sessionToken: string) {
    await handleSessionToken(sessionToken, false, true);
}
