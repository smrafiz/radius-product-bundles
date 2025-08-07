import { NavMenu } from "@shopify/app-bridge-react";
import Link from "next/link";

export default function Navigation() {
    return (
        <NavMenu>
            <Link href="/" rel="home">
                Dashboard
            </Link>
            <Link href="/bundles">
                Bundles
            </Link>
            <Link href="/analytics">
                Analytics
            </Link>
            <Link href="/ab-testing">
                A/B Testing
            </Link>
            <Link href="/automation">
                Automation
            </Link>
            <Link href="/pricing-rules">
                Pricing Rules
            </Link>
            <Link href="/templates">
                Templates
            </Link>
            <Link href="/integrations">
                Integrations
            </Link>
            <Link href="/settings">
                Settings
            </Link>
        </NavMenu>
    );
}