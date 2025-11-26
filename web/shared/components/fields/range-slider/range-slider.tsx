"use client";

import "./range-slider.css";

import { Range } from "react-range";
import { FC, useEffect, useState } from "react";

/*
 * Range slider component
 */
export const RangeSlider: FC<{
    values?: number;
    onChange?: (value: number) => void;
}> = ({ values = 8, onChange }) => {
    const [internalValue, setInternalValue] = useState([values]);

    useEffect(() => {
        setInternalValue([values]);
    }, [values]);

    const handleChange = (vals: number[]) => {
        setInternalValue(vals);
        onChange?.(vals[0]);
    };

    return (
        <div className="range-slider-container">
            <Range
                step={1}
                min={0}
                max={30}
                values={internalValue}
                onChange={handleChange}
                renderTrack={({ props, children }) => {
                    const percentage = (internalValue[0] / 30) * 100;

                    return (
                        <div
                            className="range-slider-value"
                            {...props}
                            style={{
                                ...props.style,
                                height: "4px",
                                width: "90%",
                                borderRadius: "30px",
                                backgroundImage: `
                                    linear-gradient(
                                        to right,
                                        #303030 ${percentage}%,
                                        transparent ${percentage}%
                                    ),
                                    linear-gradient(
                                        to right,
                                        var(--pc-track-dashed-color),
                                        var(--pc-track-dashed-color) 50%,
                                        transparent 50%,
                                        transparent 100%
                                    )
                                `,
                                backgroundSize: "100% 100%, 4px 100%",
                                backgroundRepeat: "repeat, repeat-x",
                            }}
                        >
                            {children}
                        </div>
                    );
                }}
                renderThumb={({ props }) => (
                    <div
                        {...props}
                        key={props.key}
                        style={{
                            ...props.style,
                            position: "relative",
                            height: "16px",
                            width: "16px",
                            borderRadius: "50%",
                            backgroundColor: "#303030",
                        }}
                    />
                )}
            />

            <div className="absolute right-0">{internalValue[0]}px</div>
        </div>
    );
};
