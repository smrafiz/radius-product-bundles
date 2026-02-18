import type { TemplateRegistry } from "@/features/settings/types";
import {
    TemplateBogo,
    TemplateBuyGet,
    TemplateCartBanner,
    TemplateFbt,
    TemplateFixed,
    TemplateMixMatch,
    TemplateVolume,
} from "@/features/settings/components/style-customizer/bundle-preview/templates";

/*
 * Template registry
 */
export const TEMPLATE_REGISTRY: TemplateRegistry = {
    FIXED_BUNDLE: TemplateFixed,
    BOGO: TemplateBogo,
    BUY_X_GET_Y: TemplateBuyGet,
    VOLUME_DISCOUNT: TemplateVolume,
    MIX_AND_MATCH: TemplateMixMatch,
    FREQUENTLY_BOUGHT_TOGETHER: TemplateFbt,
    CART_BANNER: TemplateCartBanner,
};
