import type { Bundle } from "./types";
import { escapeHtml, getLocalePath, responsiveImg } from "./utils";

const CART_LINK_SELECTORS = [
    "#cart-icon-bubble",
    "[data-cart-count-bubble]",
    ".site-header__cart-count",
    ".cart-count",
    ".js-cart-count",
];

function findCartLink(): Element | null {
    for (const selector of CART_LINK_SELECTORS) {
        const el = document.querySelector(selector);
        if (el) return el;
    }
    return null;
}

export async function updateCartCount(): Promise<void> {
    try {
        const cart = await fetch(getLocalePath("/cart.js")).then((r) =>
            r.json(),
        );
        const cartLink = findCartLink();

        if (cartLink && cart.item_count > 0) {
            let bubble = cartLink.querySelector(".cart-count-bubble");

            if (!bubble) {
                bubble = document.createElement("div");
                bubble.className = "cart-count-bubble";
                bubble.innerHTML = `
                    <span aria-hidden="true">${cart.item_count}</span>
                    <span class="visually-hidden">${cart.item_count} items</span>
                `;
                cartLink.appendChild(bubble);
            } else {
                const countSpan = bubble.querySelector('[aria-hidden="true"]');
                const srSpan = bubble.querySelector(".visually-hidden");

                if (countSpan)
                    countSpan.textContent = cart.item_count.toString();
                if (srSpan) srSpan.textContent = `${cart.item_count} items`;

                (bubble as HTMLElement).style.display = "flex";
            }
        }
    } catch (e) {
        console.warn("[RadiusBundle] Could not update cart count:", e);
    }
}

export function handleCartRedirect(
    redirectAfterCart: string,
    bundle: Bundle | null,
    lazyLoadImages: boolean,
): void {
    switch (redirectAfterCart) {
        case "default":
            openCartDrawerOrRedirect(bundle, lazyLoadImages);
            break;
        case "cart":
            window.location.href = getLocalePath("/cart");
            break;
        case "checkout":
            window.location.href = getLocalePath("/checkout");
            break;
        case "none":
            break;
        default:
            openCartDrawerOrRedirect(bundle, lazyLoadImages);
            break;
    }
}

function openCartDrawerOrRedirect(
    bundle: Bundle | null,
    lazyLoadImages: boolean,
): void {
    const cartDrawerEl = document.querySelector(
        "cart-drawer",
    ) as HTMLElement & { open?: () => void };
    if (cartDrawerEl) {
        openDawnCartDrawer(cartDrawerEl);
        return;
    }

    const cartNotificationEl = document.querySelector(
        "cart-notification",
    ) as HTMLElement & { open?: () => void };
    if (cartNotificationEl) {
        openDawnCartNotification(cartNotificationEl, bundle, lazyLoadImages);
        return;
    }

    const drawerCart = document.querySelector('[data-drawer="drawer-cart"]');
    if (drawerCart) {
        drawerCart.dispatchEvent(
            new CustomEvent("theme:drawer:open", { bubbles: false }),
        );
        return;
    }

    window.location.href = getLocalePath("/cart");
}

function openDawnCartDrawer(
    cartDrawerEl: HTMLElement & { open?: () => void },
): void {
    fetch(getLocalePath("/cart?section_id=cart-drawer"))
        .then((r) => r.text())
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const newCartDrawer = doc.querySelector("#CartDrawer");
            const currentCartDrawer = document.querySelector("#CartDrawer");

            if (newCartDrawer && currentCartDrawer) {
                currentCartDrawer.innerHTML = newCartDrawer.innerHTML;
            }

            cartDrawerEl.classList.remove("is-empty");
            const drawerInner = cartDrawerEl.querySelector(".drawer__inner");
            if (drawerInner) {
                drawerInner.classList.remove("is-empty");
            }

            const overlay = cartDrawerEl.querySelector("#CartDrawer-Overlay");
            if (overlay) {
                overlay.addEventListener("click", () => {
                    (cartDrawerEl as any).close?.();
                });
            }

            if (typeof cartDrawerEl.open === "function") {
                cartDrawerEl.open();
            }
        })
        .catch((e) => {
            console.error(
                "[RadiusBundle] Failed to fetch cart-drawer section:",
                e,
            );
            if (typeof cartDrawerEl.open === "function") {
                cartDrawerEl.open();
            }
        });
}

function openDawnCartNotification(
    cartNotificationEl: HTMLElement & { open?: () => void },
    bundle: Bundle | null,
    lazyLoadImages: boolean,
): void {
    if (!bundle) return;

    const productContainer = document.getElementById(
        "cart-notification-product",
    );
    if (productContainer) {
        const productsHtml = bundle.products
            .map(
                (product) => `
                    <div class="cart-notification-product" style="padding-top: 1rem; padding-bottom: 1rem;">
                        <div class="cart-notification-product__image global-media-settings">
                            ${
                                product.featuredImage
                                    ? responsiveImg(
                                          product.featuredImage,
                                          product.title,
                                          {
                                              lazy: lazyLoadImages,
                                              size: "thumb",
                                          },
                                      )
                                    : ""
                            }
                        </div>
                        <div>
                            <h3 class="cart-notification-product__name h4">${escapeHtml(product.title)}</h3>
                        </div>
                    </div>
                `,
            )
            .join("");

        productContainer.innerHTML = `
            <div class="cart-notification-product__bundle" style="display: flex; flex-direction: column; gap: 0.25rem;">
                <div style="color: #666; font-weight: 500;">
                    Bundle: ${escapeHtml(bundle.name)} (${bundle.products.length} items)
                </div>
                ${productsHtml}
            </div>
        `;
    }

    fetch(getLocalePath("/cart.js"))
        .then((r) => r.json())
        .then((cart) => {
            const cartButton = document.getElementById(
                "cart-notification-button",
            );
            if (cartButton) {
                cartButton.textContent = `View cart (${cart.item_count})`;
            }
        })
        .catch(() => {});

    if (typeof cartNotificationEl.open === "function") {
        cartNotificationEl.open();
    } else {
        const notification = document.getElementById("cart-notification");
        if (notification) {
            notification.classList.add("animate", "active");
        }
    }
}
