import { redirect } from "next/navigation";

/*
 * Root Page — redirect to dashboard immediately (server-side)
 */
export default function RootPage() {
    redirect("/dashboard");
}
