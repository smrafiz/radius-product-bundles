"use client";

import {
    LabelSectionConfig,
    LabelsSection,
    SectionConfig,
    SettingsTabConfig,
    SettingsTools,
    StandardSection,
    StyleSection,
} from "@/features/settings";

/**
 * Dynamically renders a settings tab based on its configuration.
 */
export function DynamicSettingsTab({ config }: { config: SettingsTabConfig }) {
    switch (config.type) {
        case "standard":
            return <StandardSections sections={config.sections || []} />;
        case "labels":
            return <LabelsSections sections={config.labelSections || []} />;
        case "style":
            return <StyleSection />;
        case "tools":
            return <SettingsTools />;
        default:
            return null;
    }
}

/**
 * Renders standard sections
 */
function StandardSections({ sections }: { sections: SectionConfig[] }) {
    return (
        <s-stack gap="large">
            {sections.map((section) => (
                <StandardSection key={section.id} config={section} />
            ))}
        </s-stack>
    );
}

/**
 * Renders label sections
 */
function LabelsSections({ sections }: { sections: LabelSectionConfig[] }) {
    return (
        <s-stack gap="large">
            {sections.map((section) => (
                <LabelsSection key={section.id} config={section} />
            ))}
        </s-stack>
    );
}
