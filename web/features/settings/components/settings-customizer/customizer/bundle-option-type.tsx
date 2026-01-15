import {
    BundleOptionsBox,
    BundleOptionsLabel,
    BundleOptionsImage,
    BundleOptionsBadge,
    BundleOptionsButton,
    BundleOptionsProduct,
    BundleOptionsHeading,
} from "@/features/settings";

export function BundleOptionType() {
    return (
        <div className="left-side-auto-scroll ">
            <BundleOptionsBox />
            <BundleOptionsBadge />
            <BundleOptionsHeading />
            <BundleOptionsProduct />
            <BundleOptionsButton />
            <BundleOptionsImage />
            <BundleOptionsLabel />
        </div>
    );
}
