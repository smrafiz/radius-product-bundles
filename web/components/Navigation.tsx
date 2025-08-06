import { NavMenu } from "@shopify/app-bridge-react";
import Link from "next/link";

export default function Navigation() {
    return (
        <NavMenu>
            <Link href={"/"} rel="home">
                Dashboard
            </Link>
            <Link href={"/bundles"}>Bundles</Link>
            <Link href={"/analytics"}>Analytics</Link>
            <Link href={"/pricing"}>Pricing</Link>
            <Link href={"/settings"}>Settings</Link>
            <Link href={"/get-help"}>Get Help</Link>
        </NavMenu>
    );
}
