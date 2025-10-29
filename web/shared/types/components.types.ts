import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

export interface GlobalFormProps<T extends FieldValues> {
    children: ReactNode;
    onSubmit?: (data: T) => Promise<void> | void;
    resetDirty: () => void;
    discardPath?: string;
}