"use client";
import React, { useEffect, useState } from "react";
import { BUNDLE_STATUSES } from "@/features/bundles";

export function BundlePriority() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const popover = document.getElementById("status-popover");

        if (!popover) {
            return;
        }

        const handleShow = () => setIsOpen(true);
        const handleHide = () => setIsOpen(false);

        popover.addEventListener("show", handleShow as EventListener);
        popover.addEventListener("hide", handleHide as EventListener);

        return () => {
            popover.removeEventListener("show", handleShow as EventListener);
            popover.removeEventListener("hide", handleHide as EventListener);
        };
    }, []);

    return (
        <s-section>
            <s-stack gap="small-200">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Bundle priority</s-heading>
                    <s-tooltip id="bundle-priority-tooltip">
                        <s-text>
                            When multiple bundles apply to the same product, the
                            bundle with the highest priority is used.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="bundle-priority-tooltip"
                    />
                </s-stack>
                <s-stack>
                    <s-number-field
                        label="Index based"
                        details="Number of items in priority"
                        placeholder="0"
                        step={1}
                        min={0}
                        max={500}
                    />
                </s-stack>

                <s-stack gap="small-500">
                    <s-text>Discount based</s-text>
                    <div className={`relative ${isOpen ? "rtpb-active-shadow" : "rtpb-normal-shadow"}`}>
                        <s-clickable
                            command="--toggle"
                            commandFor="bundle-discount-popover"
                            borderWidth="small"
                            borderColor="strong"
                            borderRadius="base"
                            padding="small-300"
                            paddingInline="small"
                            type="submit"
                            // onClick={() => setIsOpen((prev) => !prev)}
                        >
                            <div className="w-full flex justify-between items-center">
                                <s-text>
                                    <div className="font-[550]">
                                        <s-text>Highest discount</s-text>
                                    </div>
                                </s-text>
                                <div className="chevrons flex flex-col relative">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 fill-[rgba(97,97,97,1)]"
                                    >
                                        <path d="M8.884 2.323a1.25 1.25 0 0 0-1.768 0l-2.646 2.647a.749.749 0 1 0 1.06 1.06l2.47-2.47 2.47 2.47a.749.749 0 1 0 1.06-1.06z"></path>
                                        <path d="m11.53 11.03-2.646 2.647a1.25 1.25 0 0 1-1.768 0l-2.646-2.647a.749.749 0 1 1 1.06-1.06l2.47 2.47 2.47-2.47a.749.749 0 1 1 1.06 1.06"></path>
                                    </svg>
                                </div>
                            </div>
                        </s-clickable>
                    </div>

                    <s-popover id="bundle-discount-popover">
                        <div className="p-2 w-[355px]">
                            <s-stack gap="small-400">
                                {/*loop here*/}
                                <s-clickable
                                    command="--hide"
                                    commandFor="bundle-discount-popover"
                                    borderRadius="base"
                                    onClick={() => {
                                        setIsOpen(false);
                                    }}
                                >
                                    <div
                                        className={`py-1 px-2 rounded-md transition-colors`}
                                    >
                                        <s-stack gap="none">
                                            <s-heading>
                                                Highest discount offer
                                            </s-heading>
                                        </s-stack>
                                    </div>
                                </s-clickable>
                            </s-stack>
                        </div>
                    </s-popover>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
