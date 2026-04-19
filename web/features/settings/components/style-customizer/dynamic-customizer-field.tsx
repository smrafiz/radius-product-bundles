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
import { useFormContext } from "react-hook-form";
import { useTranslations } from "@/lib/i18n/provider";
import { RtpbRangeSlider, useCrossSellStore, usePlan } from "@/shared";
import { STYLE_PRESETS } from "@/features/settings/constants/defaults.constants";

/**
 * Renders a single preset card.
 */
function PresetCard({
    preset,
    presetKey,
    isActive,
    onSelect,
}: {
    preset: StylePreset;
    presetKey: string;
    isActive: boolean;
    onSelect: () => void;
}) {
    const tp = useTranslations("Settings.Customizer.Presets");

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
            {preset.preview ? (
                <s-text interestFor={`${presetKey}-preset-tooltip`}>
                    <div className="flex p-2">
                        <div
                            className="w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: preset.preview.primary }}
                            title={tp("primaryTitle")}
                        />
                        <div
                            className="-ml-2 w-6 h-6 rounded-full border border-gray-200"
                            style={{
                                backgroundColor: preset.preview.background,
                            }}
                            title={tp("backgroundTitle")}
                        />
                        <div
                            className="-ml-2 w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: preset.preview.accent }}
                            title={tp("accentTitle")}
                        />
                        <s-tooltip id={`${presetKey}-preset-tooltip`}>
                            <s-text>{tp(`${presetKey}.name`)}</s-text>
                        </s-tooltip>
                    </div>
                </s-text>
            ) : null}
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
export function DynamicCustomizerField(props: DynamicCustomizerFieldProps) {
    const isFormField = !["preset", "heading", "divider"].includes(
        props.config.type,
    );

    if (!isFormField) {
        return <DynamicNonFormField {...props} />;
    }

    return <DynamicFormFieldWrapper {...props} />;
}

function DynamicFormFieldWrapper(props: DynamicCustomizerFieldProps) {
    const { activeDevice } = useCustomizerStore();
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const t = useTranslations("Settings.Customizer");

    const proFeature = (props.config as any).proFeature as string | undefined;
    const isResponsiveLocked =
        (props.config as any).responsive === true &&
        activeDevice !== "desktop" &&
        !canUse("responsive_overrides");
    const isProLocked =
        proFeature &&
        !canUse(proFeature as any);

    const inner = <DynamicFormField {...props} />;
    const isLocked = isResponsiveLocked || isProLocked;
    const lockLabel = isProLocked
        ? ((props.config as any).label ?? proFeature)
        : t("responsiveOverrides");

    if (!isLocked) return inner;

    return (
        <div
            className="relative cursor-pointer"
            onClick={() => openCrossSell(lockLabel)}
        >
            <div className="pointer-events-none opacity-40">{inner}</div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md">
                    <s-icon type="lock" tone="neutral" />
                </span>
            </div>
        </div>
    );
}

function DynamicNonFormField({
    config,
    context,
    onFieldChangeAction,
}: DynamicCustomizerFieldProps) {
    const tc = useTranslations("Settings.Customizer.Config");

    const fieldName = (config as any).name as string | undefined;
    const _rawLabel = (config as any).label ?? "";
    const _rawDetails = (config as any).details ?? "";
    const label = fieldName
        ? tc(`field_${fieldName}_label`, undefined, _rawLabel)
        : _rawLabel;
    const details = _rawDetails
        ? (fieldName
            ? tc(`field_${fieldName}_details`, undefined, _rawDetails)
            : _rawDetails)
        : undefined;

    const applyPreset = useCustomizerStore((state) => state.applyPreset);
    const activePreset = useCustomizerStore((state) => state.activePreset);
    const activeBundleType = useCustomizerStore(
        (state) => state.activeBundleType,
    );
    const { setValue: setFormValue } = useFormContext<CustomizerStyles>();

    if (config.type === "heading") {
        if (config.layouts && config.layouts.length > 0) {
            if (!config.layouts.includes(context.activeLayout)) {
                return null;
            }
        }
        if (config.bundleTypes && config.bundleTypes.length > 0) {
            if (
                !(config.bundleTypes as string[]).includes(
                    context.activeBundleType,
                )
            ) {
                return null;
            }
        }
    }

    switch (config.type) {
        case "preset":
            return (
                <s-stack gap="small-200">
                    <s-heading>{label}</s-heading>
                    {details ? (
                        <s-text tone="neutral">
                            <span className="text-[0.75rem] text-[#616161]">
                                {details}
                            </span>
                        </s-text>
                    ) : null}
                    <div className="grid grid-cols-4 gap-2 mt-1 mb-2">
                        {Object.entries(config.presets).map(([key, preset]) => (
                            <PresetCard
                                key={key}
                                preset={preset}
                                presetKey={key}
                                isActive={activePreset === key}
                                onSelect={() => {
                                    applyPreset(key);

                                    const pathPrefix =
                                        activeBundleType &&
                                        activeBundleType !== "CART_BANNER"
                                            ? (`bundleTypeOverrides.${activeBundleType}.` as const)
                                            : ("" as const);

                                    setFormValue(
                                        `${pathPrefix}stylePreset` as any,
                                        key,
                                        { shouldDirty: true },
                                    );

                                    const presetValues =
                                        STYLE_PRESETS[key]?.values;
                                    if (presetValues) {
                                        Object.entries(presetValues).forEach(
                                            ([field, value]) => {
                                                setFormValue(
                                                    `${pathPrefix}${field}` as any,
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

        case "heading":
            return (
                <div className="bg-[#f1f1f1] border-l-4 border-current font-semibold p-2.5">
                    {label}
                    {details ? (
                        <s-text tone="neutral">
                            <span className="text-[0.75rem] text-[#616161]">
                                {details}
                            </span>
                        </s-text>
                    ) : null}
                </div>
            );

        case "divider":
            return (
                <div className="py-2">
                    {label ? (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-[#e5e7eb]" />
                            <s-text tone="neutral">{label}</s-text>
                            <div className="flex-1 h-px bg-[#e5e7eb]" />
                        </div>
                    ) : (
                        <div className="h-px bg-[#e5e7eb]" />
                    )}
                </div>
            );

        default:
            return null;
    }
}

function DynamicFormField({
    config,
    context,
    onFieldChangeAction,
    resetKey = 0,
}: DynamicCustomizerFieldProps) {
    const t = useTranslations("Settings.Customizer");
    const tc = useTranslations("Settings.Customizer.Config");

    const fieldName = (config as any).name as string | undefined;
    const _rawLabel = (config as any).label ?? "";
    const _rawDetails = (config as any).details ?? "";
    const label = fieldName
        ? tc(`field_${fieldName}_label`, undefined, _rawLabel)
        : _rawLabel;
    const details = _rawDetails
        ? (fieldName
            ? tc(`field_${fieldName}_details`, undefined, _rawDetails)
            : _rawDetails)
        : undefined;

    const {
        value,
        error,
        handleChange,
        isInherited,
        isResponsive,
        clearOverride,
        activeDevice,
    } = useCustomizerField(config as any, onFieldChangeAction);

    const handleCreateOverride = () => {
        if (value !== null && value !== undefined) {
            handleChange(value as any);
        }
    };

    if (!isFieldVisible(config as any, context)) {
        return null;
    }

    const renderError = () =>
        error ? <s-text tone="critical">{error}</s-text> : null;

    const fieldKey = `${(config as any).name || config.type}-${resetKey}`;

    switch (config.type) {
        case "color":
            return (
                <s-stack gap="small-200">
                    <s-color-field
                        key={fieldKey}
                        label={label}
                        details={details}
                        name={config.name}
                        alpha
                        placeholder={
                            config.allowInherit
                                ? t("inherit")
                                : t("selectColor")
                        }
                        value={String(value ?? "")}
                        error={error || undefined}
                        onInput={(e: Event) =>
                            handleChange(
                                (e.target as HTMLInputElement).value as any,
                            )
                        }
                    />
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // NUMBER FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "number":
            return (
                <s-stack gap="small-200">
                    {isResponsive ? (
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{label}</s-text>
                            <ResponsiveFieldIndicator
                                activeDevice={activeDevice}
                                isInherited={isInherited}
                                onOverride={handleCreateOverride}
                                onClearOverride={clearOverride}
                            />
                        </s-stack>
                    ) : null}
                    <s-number-field
                        key={fieldKey}
                        label={isResponsive ? undefined : label}
                        details={details}
                        name={config.name}
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
                                <s-text>{label}</s-text>
                                {isResponsive ? (
                                    <ResponsiveFieldIndicator
                                        activeDevice={activeDevice}
                                        isInherited={isInherited}
                                        onOverride={handleCreateOverride}
                                        onClearOverride={clearOverride}
                                    />
                                ) : null}
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
                        {details ? (
                            <s-text tone="neutral">
                                <span className="text-[0.75rem] text-[#616161]">
                                    {details}
                                </span>
                            </s-text>
                        ) : null}
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
                            <s-stack
                                direction="inline"
                                gap="small-400"
                                alignItems="center"
                            >
                                <s-text>{label}</s-text>
                                {details ? (
                                    <>
                                        <s-icon
                                            tone="neutral"
                                            type="info"
                                            interestFor={`${config.name}-group-tooltip`}
                                        />
                                        <s-tooltip
                                            id={`${config.name}-group-tooltip`}
                                        >
                                            <s-text>{details}</s-text>
                                        </s-tooltip>
                                    </>
                                ) : null}
                            </s-stack>
                            {isResponsive ? (
                                <ResponsiveFieldIndicator
                                    activeDevice={activeDevice}
                                    isInherited={isInherited}
                                    onOverride={handleCreateOverride}
                                    onClearOverride={clearOverride}
                                />
                            ) : null}
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
                                        onClick={() =>
                                            handleChange(option.value as any)
                                        }
                                    >
                                        <span
                                            className={
                                                value === option.value
                                                    ? "opacity-100 text-[#0094d5]"
                                                    : "opacity-50"
                                            }
                                        >
                                            {fieldName ? tc(`field_${fieldName}_option_${option.value}`, undefined, option.label) : option.label}
                                        </span>
                                    </s-button>
                                ))}
                            </s-button-group>
                        </div>
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
                    {isResponsive ? (
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            justifyContent="center"
                            gap="small-200"
                        >
                            <s-text>{label}</s-text>
                            <ResponsiveFieldIndicator
                                activeDevice={activeDevice}
                                isInherited={isInherited}
                                onOverride={handleCreateOverride}
                                onClearOverride={clearOverride}
                            />
                        </s-stack>
                    ) : null}
                    <s-select
                        key={fieldKey}
                        label={isResponsive ? undefined : label}
                        details={details}
                        name={config.name}
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
                                {fieldName ? tc(`field_${fieldName}_option_${option.value}`, undefined, option.label) : option.label}
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
                            <s-text>{label}</s-text>
                            {isResponsive ? (
                                <ResponsiveFieldIndicator
                                    activeDevice={activeDevice}
                                    isInherited={isInherited}
                                    onOverride={handleCreateOverride}
                                    onClearOverride={clearOverride}
                                />
                            ) : null}
                        </s-stack>
                        <s-switch
                            key={fieldKey}
                            label={label}
                            name={config.name}
                            labelAccessibilityVisibility="exclusive"
                            checked={Boolean(value)}
                            onChange={(e: Event) => {
                                const isChecked = (e.target as HTMLInputElement)
                                    .checked;
                                handleChange(isChecked as any);
                            }}
                        />
                    </s-stack>
                    {details ? (
                        <span className="text-[0.75rem] text-[#616161] -mt-2">
                            {details}
                        </span>
                    ) : null}
                </s-stack>
            );

        // ═══════════════════════════════════════════════════════════════════
        // TEXT FIELD
        // ═══════════════════════════════════════════════════════════════════
        case "text":
            return (
                <s-stack gap="small-200">
                    <s-text-field
                        key={fieldKey}
                        label={label}
                        details={details}
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
                </s-stack>
            );

        default:
            return null;
    }
}
