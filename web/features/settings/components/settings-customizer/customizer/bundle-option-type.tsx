import {
    BundleOptionsBox,
    BundleOptionsLabel,
    BundleOptionsImage,
    BundleOptionsBadge,
    BundleOptionsButton,
    BundleOptionsProduct,
    BundleOptionsHeading,
    BundleOptionsGeneral,
} from "@/features/settings";

export function BundleOptionType() {
    return (
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl">
            <s-stack>
                <BundleOptionsGeneral/>
                <BundleOptionsBox />
                <BundleOptionsBadge />
                <BundleOptionsHeading />
                <BundleOptionsProduct />
                <BundleOptionsButton />
                <BundleOptionsImage />
                <BundleOptionsLabel />
            </s-stack>
            <s-stack padding="base">
                <s-button icon="undo">Restore defaults</s-button>
            </s-stack>
        </div>
    );
}
