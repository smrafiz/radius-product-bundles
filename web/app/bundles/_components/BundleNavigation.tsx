import { usePathname, useRouter } from "next/navigation";
import { Box, Button, ButtonGroup, Card } from "@shopify/polaris";
import { ColorIcon, DiscountIcon, OrderIcon } from "@shopify/polaris-icons";

export function BundleNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Card>
            <Box padding="300">
                <ButtonGroup variant="segmented">
                    <Button
                        pressed={pathname === "/bundles"}
                        onClick={() => router.push("/bundles")}
                        icon={OrderIcon}
                    >
                        Bundles
                    </Button>
                    <Button
                        pressed={pathname === "/gallery"}
                        onClick={() => router.push("/gallery")}
                        icon={ColorIcon}
                    >
                        Bundle Studio
                    </Button>
                    <Button
                        pressed={pathname === "/pricing-rules"}
                        onClick={() => router.push("/pricing-rules")}
                        icon={DiscountIcon}
                    >
                        Pricing Rules
                    </Button>
                </ButtonGroup>
            </Box>
        </Card>
    );
}
