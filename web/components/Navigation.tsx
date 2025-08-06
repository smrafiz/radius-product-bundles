import { NavMenu } from "@shopify/app-bridge-react";
import Link from "next/link";

export default function Navigation() {
    return (
        <NavMenu>
            <Link href={"/"} rel="home">
                Home
            </Link>
            <Link href={"/new"}>
                New page
            </Link>
        </NavMenu>
    );
}