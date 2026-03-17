"use client";

import Link from "next/link";
import { NavMenu } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";

export function Navigation() {
    const t = useTranslations("Common.Navigation");

    return (
        <NavMenu>
            <Link href="/dashboard" rel="home" data-sprogress>
                {t("dashboard")}
            </Link>
            <Link href="/bundles" data-sprogress>
                {t("bundles")}
            </Link>
            <Link href="/analytics" data-sprogress>
                {t("analytics")}
            </Link>
            <Link href="/settings" data-sprogress>
                {t("settings")}
            </Link>
            <Link href="/pricing" data-sprogress>
                {t("pricing")}
            </Link>
        </NavMenu>
    );
}
