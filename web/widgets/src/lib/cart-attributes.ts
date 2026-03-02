import type { DiscountConfig } from "./types";
import { getLocalePath } from "./utils";

let pending: Promise<void> = Promise.resolve();

export function enqueueCartAttributeWrite(
    bundleId: string,
    discount: DiscountConfig,
): Promise<void> {
    pending = pending
        .catch(() => {})
        .then(() => writeCartAttribute(bundleId, discount));
    return pending;
}

async function writeCartAttribute(
    bundleId: string,
    discount: DiscountConfig,
): Promise<void> {
    const cart = await fetch(getLocalePath("/cart.js")).then((r) => r.json());

    let existing: DiscountConfig[] = [];
    if (cart.attributes?._radiusDiscounts) {
        try {
            existing = JSON.parse(cart.attributes._radiusDiscounts);
        } catch {
            existing = [];
        }
    }

    existing = existing.filter((d) => d.bundleId !== bundleId);
    existing.push(discount);

    await fetch(getLocalePath("/cart/update.js"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            attributes: { _radiusDiscounts: JSON.stringify(existing) },
        }),
    });
}
