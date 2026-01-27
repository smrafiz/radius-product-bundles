"use client";

import { useCallback, useState } from "react";
import { CustomizerSectionConfig } from "@/features/settings";

/**
 * Hook for managing a customizer section's collapse state.
 */
export function useCustomizerSection(config: CustomizerSectionConfig) {
    const [isOpen, setIsOpen] = useState(config.defaultOpen ?? false);

    /**
     * Toggles the section open/closed state.
     */
    const toggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return {
        isOpen,
        toggle,
    };
}
