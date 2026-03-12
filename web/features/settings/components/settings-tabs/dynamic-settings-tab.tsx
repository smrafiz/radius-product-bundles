"use client";

import { SettingsTabConfig } from "@/features/settings";
import { CustomizerModal } from "../style-customizer/customizer-modal";
import { DynamicSection } from "./dynamic-section";
import { LabelsLocalePicker } from "./labels-locale-picker";
import { SectionHeader } from "./section-header";
import { SettingsTools } from "./settings-tools";

/**
 * Universal tab renderer - renders any tab from config.
 */
export function DynamicSettingsTab({ config }: { config: SettingsTabConfig }) {
    // If tab has no sections, check for special components
    if (!config.sections || config.sections.length === 0) {
        return renderSpecialTab(config.id);
    }

    return (
        <s-stack gap="large">
            {config.id === "labels" && <LabelsLocalePicker />}
            {config.sections.map((section) => {
                // Check if section has a custom component
                const customField = section.fields.find(
                    (f) => f.type === "custom",
                );

                if (customField) {
                    return (
                        <s-section key={section.id}>
                            <s-stack gap="base">
                                <SectionHeader
                                    id={section.id}
                                    title={section.title}
                                    tooltip={section.tooltip}
                                />
                                {section.description && (
                                    <s-text tone="neutral">
                                        {section.description}
                                    </s-text>
                                )}
                                {renderCustomComponent(
                                    (customField as any).component,
                                )}
                            </s-stack>
                        </s-section>
                    );
                }

                // Regular section with fields
                return (
                    <DynamicSection
                        key={section.id}
                        config={section}
                        parentPath={config.parentPath}
                    />
                );
            })}
        </s-stack>
    );
}

/**
 * Renders special tabs that have no sections (like Tools)
 */
function renderSpecialTab(tabId: string) {
    switch (tabId) {
        case "tools":
            return <SettingsTools />;
        default:
            return null;
    }
}

/**
 * Custom component registry - add new custom components here
 */
const CUSTOM_COMPONENTS: Record<string, React.ComponentType> = {
    CustomizerModal: CustomizerModal,
};

/**
 * Renders a registered custom component by name
 */
function renderCustomComponent(componentName: string) {
    const Component = CUSTOM_COMPONENTS[componentName];

    if (!Component) {
        console.warn(`Custom component "${componentName}" not found`);
        return null;
    }

    return <Component />;
}
