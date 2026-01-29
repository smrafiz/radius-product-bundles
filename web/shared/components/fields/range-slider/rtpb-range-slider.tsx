"use client";

import "./range-slider.css";

import { Range } from "react-range";
import { FC, useEffect, useState } from "react";

export const RtpbRangeSlider: FC<{
    values?: number;
    maxValue?: number;
    action?: (value: number) => void;
}> = ({ values = 0, action, maxValue = 30 }) => {
    const [internalValue, setInternalValue] = useState([values]);

    useEffect(() => {
        setInternalValue([values]);
    }, [values]);

    const handleChange = (vals: number[]) => {
        setInternalValue(vals);
        action?.(vals[0]);
    };

    return (
        <div className="range-slider-container">
            <Range
                step={1}
                min={0}
                max={maxValue}
                values={internalValue}
                onChange={handleChange}
                renderTrack={({ props, children }) => {
                    const percentage = (internalValue[0] / maxValue) * 100;

                    return (
                        <div
                            className="range-slider-value"
                            {...props}
                            style={{
                                ...props.style,
                                height: "4px",
                                width: "100%",
                                borderRadius: "30px",
                                backgroundImage: `
                                    linear-gradient(
                                        to right,
                                        #303030 ${percentage}%,
                                        transparent ${percentage}%
                                    ),
                                    linear-gradient(
                                        to right,
                                        #e3e3e3,
                                        #e3e3e3 50%,
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
                        className="webkit-slider-thumb"
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
        </div>
    );
};
