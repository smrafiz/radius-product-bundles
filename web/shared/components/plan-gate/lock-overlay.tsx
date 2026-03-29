"use client";

import type { ReactNode } from "react";
import type { FeatureId } from "@/shared/types/plan";

const FEATURE_LABELS: Record<FeatureId, string> = {
    analytics_full: "Advanced Analytics",
    ab_testing: "A/B Testing",
    automation: "Automation",
    ai_insights: "AI Insights",
    custom_css: "Custom CSS",
    responsive_overrides: "Responsive Overrides",
    templates: "Templates",
    export_data: "Data Export",
    remove_branding: "Remove Branding",
};

interface LockOverlayProps {
    feature: FeatureId;
    children: ReactNode;
}

export function LockOverlay({ feature, children }: LockOverlayProps) {
    const label = FEATURE_LABELS[feature] ?? feature;

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    filter: "blur(2px)",
                    opacity: 0.4,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
                {children}
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "12px",
                    zIndex: 10,
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14 8V6a4 4 0 0 0-8 0v2H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1Zm-5-2a1 1 0 1 1 2 0v2H9V6Z"
                        fill="#6B7280"
                    />
                </svg>
                <span
                    style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                    }}
                >
                    {label}
                </span>
                <span
                    style={{
                        fontSize: "12px",
                        color: "#6B7280",
                    }}
                >
                    Available on paid plans
                </span>
                <button
                    onClick={() => {
                        // No-op for now. Wire to billing/pricing route later.
                    }}
                    style={{
                        padding: "6px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#fff",
                        background: "#2563EB",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Upgrade
                </button>
            </div>
        </div>
    );
}
