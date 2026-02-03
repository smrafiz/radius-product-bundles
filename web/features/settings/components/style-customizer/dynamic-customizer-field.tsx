"use client";

import {
    CustomizerStyles,
    DynamicCustomizerFieldProps,
    isFieldVisible,
    ResponsiveFieldIndicator,
    StylePreset,
    useCustomizerField,
    useCustomizerStore,
} from "@/features/settings";
import { RtpbRangeSlider } from "@/shared";
import { useFormContext } from "react-hook-form";
import { STYLE_PRESETS } from "@/features/settings/constants/defaults.constants";

/**
 * Renders a single preset card.
 */
function PresetCard({
    preset,
    isActive,
    onSelect,
}: {
    preset: StylePreset;
    isActive: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={`
                cursor-pointer rounded-lg border-2 flex justify-center items-center transition-all
                ${
                    isActive
                        ? "border-[#2563eb] bg-[#eff6ff]"
                        : "border-[#e5e7eb] hover:border-[#9ca3af]"
                }
            `}
            onClick={onSelect}
        >
            {/* Color preview swatches */}
            {preset.preview && (
                <s-text interestFor={`${preset.name}-preset-tooltip`}>
                    <div className="flex p-2">
                        <div
                            className="w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: preset.preview.primary }}
                            title="Primary"
                        />
                        <div
                            className="-ml-2 w-6 h-6 rounded-full border border-gray-200"
                            style={{
                                backgroundColor: preset.preview.background,
                            }}
                            title="Background"
                        />
                        <div
                            className="-ml-2 w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: preset.preview.accent }}
                            title="Accent"
                        />
                        <s-tooltip id={`${preset.name}-preset-tooltip`}>
                            <s-text>{preset.name}</s-text>
                        </s-tooltip>
                    </div>
                </s-text>
            )}
        </div>
    );
}

/**
 * Universal customizer field renderer with conditional visibility.
 *
 * Supports all field types including:
 * - color, number, range, buttonGroup, select, switch, text
 * - preset (visual preset cards)
 * - heading (section subheading)
 * - divider (visual separator)
 */
export function DynamicCustomizerField({
    config,
    context,
    onFieldChangeAction,
    resetKey = 0,
}: DynamicCustomizerFieldProps) {
    // For non-form fields, we don't need the hook
    const isFormField = !["preset", "heading", "divider"].includes(config.type);

    const fieldHook = isFormField
        ? useCustomizerField(config as any, onFieldChangeAction)
        : {
              value: null,
              error: null,
              handleChange: () => {},
              isInherited: false,
              isResponsive: false,
              clearOverride: () => {},
              activeDevice: "desktop" as const,
          };

    const {
        value,
        error,
        handleChange,
        isInherited,
        isResponsive,
        clearOverride,
        activeDevice,
    } = fieldHook;

    const handleCreateOverride = () => {
        if (value !== null && value !== undefined) {
            handleChange(value as any);
        }
    };

    // Store access for presets
    const applyPreset = useCustomizerStore((state) => state.applyPreset);
    const activePreset = useCustomizerStore((state) => state.activePreset);

    // Form context for syncing preset values to RHF
    const { setValue: setFormValue } = useFormContext<CustomizerStyles>();

    // Check visibility conditions (skip for non-conditional types)
    if (isFormField && !isFieldVisible(config as any, context)) {
        return null;
    }

    // Handle heading visibility
    if (config.type === "heading") {
        // Check layout condition for headings
        if (config.layouts && config.layouts.length > 0) {
            if (!config.layouts.includes(context.activeLayout)) {
                return null;
            }
        }
        // Check bundle type condition
        if (config.bundleTypes && config.bundleTypes.length > 0) {
            if (!config.bundleTypes.includes(context.activeBundleType)) {
                return null;
            }
        }
    }

    /**
     * Renders error message if present.
     */
    const renderError = () =>
        error ? <s-text tone="critical">{error}</s-text> : null;

    // Use resetKey to force re-mount of web components after discard
    const fieldKey = `${(config as any).name || config.type}-${resetKey}`;

    switch (config.type) {
        // ═══════════════════════════════════════════════════════════════════
        // PRESET FIELD - Visual preset cards
        // ═══════════════════════════════════════════════════════════════════
        case "preset":
            return (
                <s-stack gap="small-200">
                    <s-heading>{config.label}</s-heading>
                    {config.details && (
                        <s-text tone="neutral">
                            <span className="text-[0.75rem] text-[#616161]">
                                {config.details}
                            </span>
                        </s-text>
                    )}
                    <div className="grid grid-cols-4 gap-2 mt-1 mb-2">
                        {Object.entries(config.presets).map(([key, preset]) => (
                            <PresetCard
                                key={key}
                                preset={preset}
                                isActive={activePreset === key}
                                onSelect={() => {
                                    applyPreset(key);

                                    // Sync preset values to React Hook Form so they persist on save
                                    const presetValues =
                                        STYLE_PRESETS[key]?.values;
                                    if (presetValues) {
                                        Object.entries(presetValues).forEach(
                                            ([field, value]) => {
                                                setFormValue(
                                                    field as keyof CustomizerStyles,
                                                    value as any,
                                                    { shouldDirty: true },
                                                );
                                            },
                                        );
                                    }

                                    onFieldChangeAction?.();
                                }}
                            />
                        ))}
                    </div>
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // HEADING FIELD - Section subheading
        // ═══════════════════════════════════════════════════════════════════
        case "heading":
            return (
                <div className="bg-[#f1f1f1] border-l-4 border-current font-semibold p-2.5">
                    {config.label}
                    {config.details && (
                        <s-text tone="neutral">
                            <span className="text-[0.75rem] text-[#616161]">
                                {config.details}
                            </span>
                        </s-text>
                    )}
                </div>
            );

        // ═══════════════════════════════════════════════════════════════════
        // DIVIDER FIELD - Visual separator
        // ═══════════════════════════════════════════════════════════════════
        case "divider":
            return (
                <div className="py-2">
                    {config.label ? (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-[#e5e7eb]" />
                            <s-text tone="neutral">{config.label}</s-text>
                            <div className="flex-1 h-px bg-[#e5e7eb]" />
                        </div>
                    ) : (
                        <div className="h-px bg-[#e5e7eb]" />
                    )}
                </div>
            );

        // ═══════════════════════════════════════════════════════════════════
        // COLOR FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "color":
            return (
                <s-color-field
                    key={fieldKey}
                    label={config.label}
                    details={config.details}
                    name={config.name}
                    alpha
                    placeholder={
                        config.allowInherit ? "Inherit" : "Select color"
                    }
                    value={String(value ?? "")}
                    error={error || undefined}
                    onInput={(e: Event) =>
                        handleChange(
                            (e.target as HTMLInputElement).value as any,
                        )
                    }
                />
            );

        // ═══════════════════════════════════════════════════════════════════
        // NUMBER FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "number":
            return (
                <s-stack gap="small-200">
                    {isResponsive && (
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{config.label}</s-text>
                            <ResponsiveFieldIndicator
                                activeDevice={activeDevice}
                                isInherited={isInherited}
                                onOverride={handleCreateOverride}
                                onClearOverride={clearOverride}
                            />
                        </s-stack>
                    )}
                    <s-number-field
                        key={fieldKey}
                        label={isResponsive ? undefined : config.label}
                        details={config.details}
                        placeholder="0"
                        step={config.step ?? 1}
                        min={config.min}
                        max={config.max}
                        value={String(value ?? 0)}
                        error={error || undefined}
                        onInput={(e: Event) =>
                            handleChange(
                                Number(
                                    (e.target as HTMLInputElement).value,
                                ) as any,
                            )
                        }
                    />
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // RANGE FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "range":
            return (
                <s-stack gap="small-200">
                    <s-stack gap="small-400">
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <s-stack
                                direction="inline"
                                alignItems="center"
                                justifyContent="center"
                                gap="small-200"
                            >
                                <s-text>{config.label}</s-text>
                                {isResponsive && (
                                    <ResponsiveFieldIndicator
                                        activeDevice={activeDevice}
                                        isInherited={isInherited}
                                        onOverride={handleCreateOverride}
                                        onClearOverride={clearOverride}
                                    />
                                )}
                            </s-stack>
                            <s-text tone="neutral">
                                {value}
                                {config.suffix || ""}
                            </s-text>
                        </s-stack>
                        <div
                            style={{
                                paddingBlock: "8px",
                                borderRadius: "4px",
                                border: error ? "2px solid #8e0b21" : "none",
                            }}
                        >
                            <RtpbRangeSlider
                                key={fieldKey}
                                values={Number(value ?? config.min ?? 0)}
                                maxValue={config.max ?? 100}
                                action={(val) => handleChange(val as any)}
                            />
                        </div>
                        {config.details && (
                            <s-text tone="neutral">
                                <span className="text-[0.75rem] text-[#616161]">
                                    {config.details}
                                </span>
                            </s-text>
                        )}
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // BUTTON GROUP FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "buttonGroup":
            return (
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{config.label}</s-text>
                            {isResponsive && (
                                <ResponsiveFieldIndicator
                                    activeDevice={activeDevice}
                                    isInherited={isInherited}
                                    onOverride={handleCreateOverride}
                                    onClearOverride={clearOverride}
                                />
                            )}
                        </s-stack>
                        <div
                            style={{
                                borderRadius: "4px",
                                border: error ? "2px solid #8e0b21" : "none",
                            }}
                        >
                            <s-button-group gap="none">
                                {config.options.map((option) => (
                                    <s-button
                                        key={String(option.value)}
                                        slot="secondary-actions"
                                        tone={
                                            value === option.value
                                                ? "critical"
                                                : "neutral"
                                        }
                                        onClick={() =>
                                            handleChange(option.value as any)
                                        }
                                    >
                                        <span
                                            className={
                                                value === option.value
                                                    ? "opacity-100"
                                                    : "opacity-60"
                                            }
                                        >
                                            {option.label}
                                        </span>
                                    </s-button>
                                ))}
                            </s-button-group>
                        </div>
                        {config.details && (
                            <s-text tone="neutral">
                                <span className="block text-[0.75rem] text-[#616161] -mt-1">
                                    {config.details}
                                </span>
                            </s-text>
                        )}
                    </s-stack>
                    {renderError()}
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // SELECT FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "select":
            return (
                <s-stack gap="small-200">
                    {isResponsive && (
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{config.label}</s-text>
                            <ResponsiveFieldIndicator
                                activeDevice={activeDevice}
                                isInherited={isInherited}
                                onOverride={handleCreateOverride}
                                onClearOverride={clearOverride}
                            />
                        </s-stack>
                    )}
                    <s-select
                        key={fieldKey}
                        label={isResponsive ? undefined : config.label}
                        details={config.details}
                        value={String(value ?? "")}
                        error={error || undefined}
                        onInput={(e: Event) => {
                            const targetValue = (e.target as HTMLSelectElement)
                                .value;
                            const convertedValue = config.options.find(
                                (opt) => String(opt.value) === targetValue,
                            )?.value;
                            handleChange(convertedValue as any);
                        }}
                    >
                        {config.options.map((option) => (
                            <s-option
                                key={option.value}
                                value={String(option.value)}
                            >
                                {option.label}
                            </s-option>
                        ))}
                    </s-select>
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // SWITCH FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "switch":
            return (
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{config.label}</s-text>
                            {isResponsive && (
                                <ResponsiveFieldIndicator
                                    activeDevice={activeDevice}
                                    isInherited={isInherited}
                                    onOverride={handleCreateOverride}
                                    onClearOverride={clearOverride}
                                />
                            )}
                        </s-stack>
                        <s-switch
                            key={fieldKey}
                            label={config.label}
                            labelAccessibilityVisibility="exclusive"
                            checked={Boolean(value)}
                            onChange={(e: Event) => {
                                const isChecked = (e.target as HTMLInputElement)
                                    .checked;
                                handleChange(isChecked as any);
                            }}
                        />
                    </s-stack>
                    {config.details && (
                        <span className="text-[0.75rem] text-[#616161] -mt-2">
                            {config.details}
                        </span>
                    )}
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // TEXT FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "text":
            return (
                <s-text-field
                    key={fieldKey}
                    label={config.label}
                    details={config.details}
                    name={config.name}
                    placeholder={config.placeholder || ""}
                    value={String(value ?? "")}
                    error={error || undefined}
                    onInput={(e: Event) =>
                        handleChange(
                            (e.target as HTMLInputElement).value as any,
                        )
                    }
                />
            );

        default:
            return null;
    }
}
