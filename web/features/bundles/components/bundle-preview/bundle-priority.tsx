"use client";

import React, { useEffect, useState } from "react";
import { BUNDLE_PRIORITY, useBundleStore } from "@/features/bundles";

export function BundlePriority() {
    const [isOpen, setIsOpen] = useState(false);
    const { bundleData, updateBundleField } = useBundleStore();

    const priorityType = bundleData.priorityType ?? "index_based";

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
                            The bundle with the highest priority is displayed
                            when multiple bundles apply to a product.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="bundle-priority-tooltip"
                    />
                </s-stack>

                <s-stack gap="small-500">
                    <div
                        className={`relative ${isOpen ? "rtpb-active-shadow" : "rtpb-normal-shadow"}`}
                    >
                        <s-clickable
                            command="--toggle"
                            commandFor="bundle-discount-popover"
                            borderWidth="small"
                            borderColor="strong"
                            borderRadius="base"
                            padding="small-300"
                            paddingInline="small"
                        >
                            <div className="w-full flex justify-between items-center">
                                <div className="font-[550]">
                                    <s-text>
                                        {
                                            BUNDLE_PRIORITY.find(
                                                (p) => p.id === priorityType,
                                            )?.title
                                        }
                                    </s-text>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    className="w-4 h-4 fill-[rgba(97,97,97,1)]"
                                >
                                    <path d="M8.884 2.323a1.25 1.25 0 0 0-1.768 0l-2.646 2.647a.749.749 0 1 0 1.06 1.06l2.47-2.47 2.47 2.47a.749.749 0 1 0 1.06-1.06z" />
                                    <path d="m11.53 11.03-2.646 2.647a1.25 1.25 0 0 1-1.768 0l-2.646-2.647a.749.749 0 1 1 1.06-1.06l2.47 2.47 2.47-2.47a.749.749 0 1 1 1.06 1.06" />
                                </svg>
                            </div>
                        </s-clickable>
                    </div>

                    <s-popover id="bundle-discount-popover">
                        <div className="p-2 w-88.75">
                            <s-stack gap="small-400">
                                {/*loop here*/}
                                {BUNDLE_PRIORITY.map((priority) => (
                                    <s-clickable
                                        key={priority.id}
                                        command="--hide"
                                        commandFor="bundle-discount-popover"
                                        borderRadius="base"
                                        onClick={() => {
                                            updateBundleField(
                                                "priorityType",
                                                priority.id as
                                                    | "index_based"
                                                    | "discount_based",
                                            );
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div
                                            className={`py-1 px-2 rounded-md transition-colors
                                                ${priorityType === priority.id ? "bg-[#ebebeb]" : "hover:bg-[#f7f7f7]"}`}
                                        >
                                            <s-stack gap="none">
                                                <s-heading>
                                                    {priority.title}
                                                </s-heading>
                                                <s-paragraph color="subdued">
                                                    {priority.description}
                                                </s-paragraph>
                                            </s-stack>
                                        </div>
                                    </s-clickable>
                                ))}
                            </s-stack>
                        </div>
                    </s-popover>
                </s-stack>

                {priorityType === "index_based" && (
                    <s-stack>
                        <s-number-field
                            label="Index based"
                            labelAccessibilityVisibility="exclusive"
                            details="Number of items in priority"
                            placeholder="0"
                            step={1}
                            min={0}
                            max={500}
                            value={String(bundleData.priority ?? 0)}
                            onChange={(e: any) => {
                                const val = Number(e.target.value);
                                updateBundleField("priority", isNaN(val) ? 0 : val);
                            }}
                        />
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
