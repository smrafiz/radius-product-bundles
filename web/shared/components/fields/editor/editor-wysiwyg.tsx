"use client";
import React from "react";
import Editor from "react-simple-wysiwyg";
import { useBundleProduct } from "@/features/bundles";

import { ContentEditableEvent } from "react-simple-wysiwyg";
import "./editor-wysiwyg.css";

export function EditorWysiwyg({ mode }: { mode: "create" | "edit" }) {
    const { handleDescriptionChange, productDescription } =
        useBundleProduct(mode);

    return (
        <div className="rt-wysiwyg-editor">
            <s-stack gap="small-400">
                <s-text>Description</s-text>
                <Editor
                    name="productDescription"
                    value={productDescription}
                    placeholder="Describe this bundle product..."
                    onChange={(event: ContentEditableEvent) => {
                        handleDescriptionChange(event.target.value);
                    }}
                />
            </s-stack>
        </div>
    );
}
