"use client"

import { useEffect, useState, useCallback, useRef } from "react";

interface ScrollBlurState {
    isScrolledTop: boolean;
    isScrolledBottom: boolean;
    scrollProgress: number;
}

interface UseScrollBlurOptions {
    threshold?: number;
    onScrollChange?: (state: ScrollBlurState) => void;
}

/**
 * Hook to detect scroll position and apply blur effect classes.
 * Uses a callback ref to handle conditional rendering.
 *
 * @param options - Configuration options
 * @returns Object containing ref callback and scroll state
 */
export function useScrollBlur(options: UseScrollBlurOptions = {}) {
    const { threshold = 10, onScrollChange } = options;
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    const [scrollState, setScrollState] = useState<ScrollBlurState>({
        isScrolledTop: false,
        isScrolledBottom: false,
        scrollProgress: 0,
    });

    // Callback ref - called when element mounts/unmounts
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        // Cleanup previous listeners if any
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setContainer(node);
    }, []);

    useEffect(() => {
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const maxScroll = scrollHeight - clientHeight;
            const hasScrollableContent = maxScroll > threshold;
            const scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;

            const newState: ScrollBlurState = {
                // Only show top blur if there's scrollable content AND user has scrolled down
                isScrolledTop: hasScrollableContent && scrollTop > threshold,
                // Only show bottom blur if there's scrollable content AND user hasn't reached bottom
                isScrolledBottom: hasScrollableContent && scrollTop < maxScroll - threshold,
                scrollProgress,
            };

            setScrollState(newState);
            onScrollChange?.(newState);

            // Apply classes directly for performance
            container.classList.toggle("is-scrolled-top", newState.isScrolledTop);
            container.classList.toggle("is-scrolled-bottom", newState.isScrolledBottom);
        };

        // Initial check with small delay to ensure content is rendered
        const initialCheckTimeout = setTimeout(handleScroll, 50);

        // Add scroll listener
        container.addEventListener("scroll", handleScroll, { passive: true });

        // ResizeObserver to handle content/size changes
        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(container);

        // MutationObserver to detect content changes
        const mutationObserver = new MutationObserver(handleScroll);
        mutationObserver.observe(container, { childList: true, subtree: true });

        // Store cleanup function
        cleanupRef.current = () => {
            clearTimeout(initialCheckTimeout);
            container.removeEventListener("scroll", handleScroll);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };

        return cleanupRef.current;
    }, [container, threshold, onScrollChange]);

    return {
        containerRef,
        ...scrollState,
    };
}