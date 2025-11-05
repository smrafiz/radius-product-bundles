import { FC } from "react";
import "@/styles/fields/Knob.css";
import { KnobProps } from "@/shared";

/**
 * Accessible toggle knob
 */
export const Knob: FC<KnobProps> = ({ ariaLabel, selected, onClick }) => {
    return (
        <button
            type="button"
            className={`track ${selected ? "track_on" : ""}`}
            aria-label={ariaLabel}
            role="switch"
            aria-checked={selected}
            onClick={onClick}
        >
            <div className={`knob ${selected ? "knob_on" : ""}`}></div>
        </button>
    );
};
