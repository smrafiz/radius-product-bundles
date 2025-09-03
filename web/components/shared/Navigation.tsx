import Link from "next/link";
import { NavMenu } from "@shopify/app-bridge-react";

export default function Navigation() {
    return (
        <NavMenu>
            <Link href="/dashboard" rel="home" data-nprogress>
                Dashboard
            </Link>
            <Link href="/bundles" data-nprogress>
                Bundles
            </Link>
            <Link href="/analytics" data-nprogress>
                Analytics
            </Link>
            <Link href="/ab-testing" data-nprogress>
                A/B Testing
            </Link>
            <Link href="/automation" data-nprogress>
                Automation
            </Link>
            <Link href="/pricing-rules" data-nprogress>
                Pricing Rules
            </Link>
            <Link href="/templates" data-nprogress>
                Templates
            </Link>
            <Link href="/integrations" data-nprogress>
                Integrations
            </Link>
            <Link href="/settings" data-nprogress>
                Settings
            </Link>
        </NavMenu>
    );
}
