"use client";

import Link from "next/link";
import { NavMenu } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared/hooks/plan";
import type { FeatureId } from "@/shared/types/plan";

interface NavItem {
    href: string;
    labelKey: string;
    rel?: string;
    feature?: FeatureId;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/dashboard", labelKey: "dashboard", rel: "home" },
    { href: "/bundles", labelKey: "bundles" },
    { href: "/analytics", labelKey: "analytics", feature: "analytics_full" },
    { href: "/settings", labelKey: "settings" },
    { href: "/pricing", labelKey: "pricing" },
    { href: "/support", labelKey: "support" },
];

export function Navigation() {
    const t = useTranslations("Common.Navigation");
    const { getGateMode } = usePlan();

    return (
        <NavMenu>
            {NAV_ITEMS.filter((item) => {
                if (!item.feature) return true;
                return getGateMode(item.feature) !== "hidden";
            }).map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    rel={item.rel}
                    data-sprogress
                >
                    {t(item.labelKey)}
                </Link>
            ))}
        </NavMenu>
    );
}
