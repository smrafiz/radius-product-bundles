import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

/*
 * GlobalForm Props
 */
export interface GlobalFormProps<T extends FieldValues> {
    children: ReactNode;
    onSubmit?: (data: T) => Promise<void> | void;
    resetDirty: () => void;
    discardPath?: string;
}

export interface KnobProps {
    ariaLabel: string;
    selected: boolean;
    onClick: () => void;
}
