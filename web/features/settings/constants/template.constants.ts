import {
    TemplateBogo,
    TemplateBuyGet,
    TemplateFbt,
    TemplateFixed,
    TemplateMixMatch,
    TemplateRegistry,
    TemplateVolume,
} from "@/features/settings";

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
};
