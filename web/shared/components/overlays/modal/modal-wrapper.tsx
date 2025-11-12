"use client";

import { useEffect, useState } from "react";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Wait until <s-modal> custom element is registered
        customElements.whenDefined("s-modal").then(() => setReady(true));
    }, []);

    if (!ready) return null; // or a spinner if you prefer

    return <>{children}</>;
}
