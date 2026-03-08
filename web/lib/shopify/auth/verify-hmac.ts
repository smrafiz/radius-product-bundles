import { createHmac, timingSafeEqual } from "crypto";

export function verifyOAuthHmac(query: URLSearchParams): boolean {
    const hmac = query.get("hmac");
    if (!hmac) return false;

    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) throw new Error("SHOPIFY_API_SECRET not configured");

    const params = new URLSearchParams();
    for (const [key, value] of query.entries()) {
        if (key !== "hmac") {
            params.append(key, value);
        }
    }
    params.sort();
    const message = params.toString();

    const computed = createHmac("sha256", secret).update(message).digest("hex");

    if (computed.length !== hmac.length) return false;
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hmac));
}
