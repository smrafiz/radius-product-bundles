/*
 * Show modal element
 */
export function showModalElement() {
    setTimeout(() => {
        const modalElement = document.getElementById(
            "radius-bundles-app-modal",
        ) as HTMLElement & { showOverlay?: () => void };

        if (modalElement?.showOverlay) {
            modalElement.showOverlay();
        }
    }, 100);
}