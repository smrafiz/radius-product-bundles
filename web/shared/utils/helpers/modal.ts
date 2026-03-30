import { useModalStore } from "@/shared/stores/modal.store";

/*
 * Open quota-exceeded modal with upgrade CTA
 */
export function openQuotaExceededModal(
    quota: { current: number; limit: number },
    texts: { title: string; message: string; confirmText: string },
) {
    useModalStore.getState().openModal({
        type: "quota-exceeded",
        title: texts.title,
        message: texts.message,
        confirmText: texts.confirmText,
    });
}

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
