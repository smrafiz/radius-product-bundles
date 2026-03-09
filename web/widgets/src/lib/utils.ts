export function formatMoney(cents: number): string {
    if (typeof window.Shopify?.formatMoney === "function") {
        return window.Shopify.formatMoney(cents);
    }

    const amount = cents / 100;
    const currency = window.Shopify?.currency?.active || "USD";
    const locale = window.Shopify?.locale || "en";

    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            currencyDisplay: "narrowSymbol",
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export function trimMoney(value: string): string {
    return value.replace(/[.,]00(?=\s*\D*$)/, "");
}

export function formatLabel(
    template: string,
    values: Record<string, string | number>,
): string {
    return template.replace(/\{(\w+)\}/g, (_, key) =>
        values[key] !== undefined ? String(values[key]) : "",
    );
}

export function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

export function extractNumericId(gid: string): string {
    if (!gid) return "";
    if (/^\d+$/.test(gid)) return gid;
    const match = gid.match(/\/(\d+)$/);
    return match ? match[1] : gid;
}

export function getLocalePath(path: string): string {
    const root = window.Shopify?.routes?.root || "/";
    return `${root}${path.replace(/^\//, "")}`;
}

export function showToast(message: string, type: "success" | "error"): void {
    const existingToast = document.querySelector(".radius-bundle-toast");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = `radius-bundle-toast radius-bundle-toast--${type}`;

    const icon =
        type === "success"
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.innerHTML = `
        <div class="radius-bundle-toast__icon">${icon}</div>
        <div class="radius-bundle-toast__message">${escapeHtml(message)}</div>
        <button class="radius-bundle-toast__close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("radius-bundle-toast--visible");
    });

    const closeBtn = toast.querySelector(".radius-bundle-toast__close");
    const closeToast = () => {
        toast.classList.remove("radius-bundle-toast--visible");
        setTimeout(() => toast.remove(), 300);
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", closeToast);
    }

    setTimeout(closeToast, 4000);
}

export function showError(container: HTMLElement, message: string): void {
    const productsContainer = container.querySelector("[data-bundle-products]");
    if (productsContainer) {
        productsContainer.innerHTML = `<div class="radius-bundle__error">${escapeHtml(message)}</div>`;
    }
}

export function getLayout(container: HTMLElement): string {
    if (container.classList.contains("radius-bundle--grid")) return "grid";
    if (container.classList.contains("radius-bundle--carousel"))
        return "slider";
    if (container.classList.contains("radius-bundle--compact"))
        return "compact";
    if (container.classList.contains("radius-bundle--classic_card"))
        return "classic_card";
    if (container.classList.contains("radius-bundle--compact_grid"))
        return "compact_grid";
    if (container.classList.contains("radius-bundle--minimalist"))
        return "minimalist";
    if (container.classList.contains("radius-bundle--sleek")) return "sleek";
    if (container.classList.contains("radius-bundle--checklist"))
        return "checklist";
    if (container.classList.contains("radius-bundle--split_deal"))
        return "split_deal";
    return "list";
}

export function countBundlesInCart(
    items: Array<{ properties?: Record<string, string> }>,
): number {
    const bundleIds = new Set<string>();
    for (const item of items) {
        const bundleId = item.properties?._bundle_id;
        if (bundleId) {
            bundleIds.add(bundleId);
        }
    }
    return bundleIds.size;
}
