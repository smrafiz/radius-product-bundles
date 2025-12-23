import {
    BundleOptionsBox,
    BundleOptionsButton,
    BundleOptionsProduct,
    BundleOptionsImage,
} from "@/features/settings";

export function BundleOptionsType() {
    return(
        <div className="left-side-auto-scroll ">
            <BundleOptionsBox/>
            <BundleOptionsProduct/>
            <BundleOptionsButton/>
            <BundleOptionsImage/>
        </div>
    )
}