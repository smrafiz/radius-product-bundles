import {
    BundleOptionsBox,
    BundleOptionsImage,
    BundleOptionsButton,
    BundleOptionsProduct,
    BundleOptionsAdditional,
} from "@/features/settings";

export function BundleOptionType() {
    return (
        <div className="left-side-auto-scroll ">
            <BundleOptionsBox />
            <BundleOptionsProduct />
            <BundleOptionsButton />
            <BundleOptionsImage />
            <BundleOptionsAdditional />
        </div>
    );
}
