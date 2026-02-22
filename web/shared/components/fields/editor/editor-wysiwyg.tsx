"use client";

import "./editor-wysiwyg.css";

import { useState } from "react";
import { useBundleProduct } from "@/features/bundles";
import Editor, { ContentEditableEvent } from "react-simple-wysiwyg";

/*
 * Editor WYSIWYG component
 */
export function EditorWysiwyg({ mode }: { mode: "create" | "edit" }) {
    const {
        handleDescriptionChange,
        handleDescriptionBlur,
        productDescription,
    } = useBundleProduct(mode);

    const [focused, setFocused] = useState(false);

    return (
        <div className={`rt-wysiwyg-editor ${focused ? "is-focused" : ""}`}>
            <s-stack gap="small-400">
                <s-text>Description</s-text>
                <Editor
                    name="productDescription"
                    value={productDescription}
                    autoFocus={false}
                    placeholder="Describe this bundle product..."
                    onChange={(event: ContentEditableEvent) => {
                        handleDescriptionChange(event.target.value);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        handleDescriptionBlur();
                    }}
                />
            </s-stack>
        </div>
    );
}
