import {
    BundleOptionsBox,
    BundleOptionsButton,
    BundleOptionsProduct,
    BundleOptionsImage,
} from "@/features/settings";

export function BundleOptionsType() {
    return(
        <div className="left-side-auto-scroll border border-[#e3e3e3] bg-white rounded-xl overflow-hidden">
            <BundleOptionsBox/>
            <BundleOptionsProduct/>
            <BundleOptionsButton/>
            <BundleOptionsImage/>
        </div>
    )
}