import React from 'react';
import "@/styles/fields/Knob.css";

interface Props {
    ariaLabel: string;
    selected: boolean;
    onClick: () => void;
}

/**
 * Accessible toggle knob
 */
export const Knob: React.FC<Props> = ({ ariaLabel, selected, onClick }) => {
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