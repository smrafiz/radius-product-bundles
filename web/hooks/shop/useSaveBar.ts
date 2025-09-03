import { useCallback, useEffect, useRef } from "react";

interface SaveBarConfig {
    isDirty: boolean;
    isLoading?: boolean;
    onSave?: () => Promise<void> | void;
    onDiscard?: () => Promise<void> | void;
    saveBarId?: string;
    showDiscardConfirmation?: boolean;
}

// Type definitions for Shopify SaveBar API
declare global {
    interface Window {
        shopify?: {
            saveBar?: {
                show: (id: string) => Promise<void>;
                hide: (id: string) => Promise<void>;
                toggle: (id: string) => Promise<void>;
                leaveConfirmation: () => Promise<void>;
            };
        };
    }
}

export function useSaveBar({
    isDirty,
    isLoading = false,
    onSave,
    onDiscard,
    saveBarId = "bundle-save-bar",
    showDiscardConfirmation = true,
}: SaveBarConfig) {
    const saveBarRef = useRef<HTMLElement | null>(null);

    // Create ui-save-bar element
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        let saveBarElement = document.getElementById(saveBarId);

        if (!saveBarElement) {
            saveBarElement = document.createElement("ui-save-bar");
            saveBarElement.id = saveBarId;

            if (showDiscardConfirmation) {
                saveBarElement.setAttribute(
                    "data-discard-confirmation",
                    "true",
                );
            }

            document.body.appendChild(saveBarElement);
        }

        saveBarRef.current = saveBarElement;

        // Cleanup function
        return () => {
            if (saveBarElement && document.body.contains(saveBarElement)) {
                try {
                    document.body.removeChild(saveBarElement);
                } catch (error) {
                    console.warn("SaveBar cleanup error:", error);
                }
            }
        };
    }, [saveBarId, showDiscardConfirmation]);

    // Show/hide SaveBar based on the dirty state
    useEffect(() => {
        if (typeof window === "undefined" || !window.shopify?.saveBar) {
            return;
        }

        const controlSaveBar = async () => {
            try {
                if (isDirty && !isLoading) {
                    await window.shopify.saveBar.show(saveBarId);
                } else {
                    await window.shopify.saveBar.hide(saveBarId);
                }
            } catch (error) {
                console.warn("SaveBar control error:", error);
            }
        };

        void controlSaveBar();
    }, [isDirty, isLoading, saveBarId]);

    // Handle SaveBar events
    useEffect(() => {
        const saveBarElement = saveBarRef.current;

        if (!saveBarElement) {
            return;
        }

        const handleSave = async (event: Event) => {
            event.preventDefault();

            if (onSave && !isLoading) {
                try {
                    await onSave();
                } catch (error) {
                    console.error("SaveBar save failed:", error);
                }
            }
        };

        const handleDiscard = async (event: Event) => {
            event.preventDefault();

            if (onDiscard && !isLoading) {
                try {
                    await onDiscard();
                } catch (error) {
                    console.error("SaveBar discard failed:", error);
                }
            }
        };

        // Listen for SaveBar events
        saveBarElement.addEventListener("save", handleSave);
        saveBarElement.addEventListener("discard", handleDiscard);

        return () => {
            saveBarElement.removeEventListener("save", handleSave);
            saveBarElement.removeEventListener("discard", handleDiscard);
        };
    }, [onSave, onDiscard, isLoading]);

    // Manual control methods
    const showSaveBar = useCallback(async () => {
        if (window.shopify?.saveBar) {
            try {
                await window.shopify.saveBar.show(saveBarId);
            } catch (error) {
                console.warn("Manual show SaveBar failed:", error);
            }
        }
    }, [saveBarId]);

    const hideSaveBar = useCallback(async () => {
        if (window.shopify?.saveBar) {
            try {
                await window.shopify.saveBar.hide(saveBarId);
            } catch (error) {
                console.warn("Manual hide SaveBar failed:", error);
            }
        }
    }, [saveBarId]);

    const leaveConfirmation = useCallback(async () => {
        if (window.shopify?.saveBar) {
            try {
                await window.shopify.saveBar.leaveConfirmation();
                return true;
            } catch (error) {
                console.warn("Leave confirmation failed:", error);
                return false;
            }
        }
        return true;
    }, []);

    return {
        showSaveBar,
        hideSaveBar,
        leaveConfirmation,
        saveBarElement: saveBarRef.current,
    };
}
