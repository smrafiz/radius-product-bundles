/**
 * Cross-tab synchronization using BroadcastChannel API
 *
 * Broadcasts cache invalidation events to all browser tabs.
 */

import { InvalidationMessage } from "@/shared";

const CHANNEL_NAME = "radius-bundle-app-sync";

let channel: BroadcastChannel | null = null;

/**
 * Initialize broadcast channel
 */
export function initCrossTabSync(): BroadcastChannel | null {
    if (typeof window === "undefined") {
        return null;
    }

    if (!channel) {
        try {
            channel = new BroadcastChannel(CHANNEL_NAME);
            console.log("[CrossTabSync] Initialized");
        } catch (error) {
            console.error("[CrossTabSync] Failed to initialize:", error);
            return null;
        }
    }

    return channel;
}

/**
 * Broadcast invalidation to other tabs
 */
export function broadcastInvalidation(type: InvalidationMessage["type"]) {
    const channel = initCrossTabSync();

    if (!channel) {
        return;
    }

    const message: InvalidationMessage = {
        type,
        timestamp: Date.now(),
    };

    try {
        channel.postMessage(message);
        console.log(
            `%c[CrossTabSync] 📤 Broadcasted: ${message.type}`,
            "color: #00ff00; font-weight: bold",
        );
    } catch (error) {
        console.error("[CrossTabSync] Broadcast failed:", error);
    }
}

/**
 * Listen for invalidation messages from other tabs
 */
export function listenForInvalidations(
    callback: (message: InvalidationMessage) => void,
): () => void {
    const channel = initCrossTabSync();

    if (!channel) {
        return () => {};
    }

    const handler = (event: MessageEvent<InvalidationMessage>) => {
        console.log(
            `%c[CrossTabSync] 📥 Received: ${event.data.type}`,
            "color: #00bfff; font-weight: bold",
        );
        callback(event.data);
    };

    channel.addEventListener("message", handler);

    return () => {
        channel.removeEventListener("message", handler);
    };
}

/**
 * Close broadcast channel (cleanup)
 */
export function closeCrossTabSync() {
    if (channel) {
        channel.close();
        channel = null;
        console.log("[CrossTabSync] Channel closed");
    }
}
