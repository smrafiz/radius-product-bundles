import * as React from "react";
import { Range } from "react-range";
import "./range-slider.css";

export const RangeSlider: React.FC = () => {
    const [values, setValues] = React.useState([8]);

    return (
        <div className="range-slider-container">
            <Range
                step={1}
                min={0}
                max={30}
                values={values}
                onChange={(vals) => setValues(vals)}
                renderTrack={({ props, children }) => {
                    const percentage = (values[0] / 30) * 100;

                    return (
                        <div
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
                                        var(--pc-track-dashed-color),
                                        var(--pc-track-dashed-color) 50%,
                                        transparent 50%,
                                        transparent 100%
                                    )
                                `,
                                backgroundSize: "100% 100%, 4px 100%",
                                backgroundRepeat: "no-repeat, repeat-x",
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
                            height: "16px",
                            width: "16px",
                            borderRadius: "50%",
                            backgroundColor: "#303030",
                        }}
                    />
                )}
            />

            <div>{values[0]}px</div>
        </div>
    );
};
