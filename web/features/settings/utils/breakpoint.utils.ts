import { BreakpointPreset, CustomizerStyles } from "@/features/settings";
import { BREAKPOINT_PRESET_VALUES } from "@/features/settings/constants/defaults.constants";

export function resolveBreakpoints(styles: Partial<CustomizerStyles>): {
    tablet: number;
    mobile: number;
} {
    if (styles.customBreakpoints) {
        const tablet = styles.tabletBreakpoint ?? 1024;
        const mobile = styles.mobileBreakpoint ?? 768;
        return {
            tablet,
            mobile: Math.min(mobile, tablet - 1),
        };
    }

    const preset = styles.breakpointPreset ?? "standard";
    return (
        BREAKPOINT_PRESET_VALUES[preset as BreakpointPreset] ??
        BREAKPOINT_PRESET_VALUES.standard
    );
}
