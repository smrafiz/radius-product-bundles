import Link from "next/link";
import { NavMenu } from "@shopify/app-bridge-react";

export default function Navigation() {
    return (
        <NavMenu>
            <Link href="/dashboard" rel="home" data-sprogress>Dashboard</Link>
            <Link href="/bundles" data-sprogress>Bundles</Link>
            <Link href="/analytics" data-sprogress>Analytics</Link>
            <Link href="/ab-testing" data-sprogress>A/B Testing</Link>
            <Link href="/automation" data-sprogress>Automation</Link>
            <Link href="/pricing-rules" data-sprogress>Pricing Rules</Link>
            <Link href="/templates" data-sprogress>Templates</Link>
            <Link href="/integrations" data-sprogress>Integrations</Link>
            <Link href="/settings" data-sprogress>Settings</Link>
        </NavMenu>
    );
}
