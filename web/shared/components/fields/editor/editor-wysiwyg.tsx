"use client";

import "./editor-wysiwyg.css";

import { useState, useRef, useEffect } from "react";
import { useBundleProduct } from "@/features/bundles";
import Editor, { ContentEditableEvent } from "react-simple-wysiwyg";
import { useTranslations } from "@/lib/i18n/provider";

/*
 * Editor WYSIWYG component
 */
export function EditorWysiwyg({ mode }: { mode: "create" | "edit" }) {
    const t = useTranslations("Bundles.Creation.BundleAsProduct");
    const {
        handleDescriptionChange,
        handleDescriptionBlur,
        productDescription,
    } = useBundleProduct(mode);

    const [focused, setFocused] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ce = editorRef.current?.querySelector<HTMLElement>("[contenteditable]");
        if (ce) {
            ce.setAttribute("aria-labelledby", "wysiwyg-description-label");
        }
    }, []);

    return (
        <div className={`rt-wysiwyg-editor ${focused ? "is-focused" : ""}`}>
            <s-stack gap="small-400">
                <s-text id="wysiwyg-description-label">{t("descriptionLabel")}</s-text>
                <div ref={editorRef} role="group">
                    <Editor
                        name="productDescription"
                        value={productDescription}
                        autoFocus={false}
                        placeholder={t("descriptionPlaceholder")}
                        onChange={(event: ContentEditableEvent) => {
                            handleDescriptionChange(event.target.value);
                        }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => {
                            setFocused(false);
                            handleDescriptionBlur();
                        }}
                    />
                </div>
            </s-stack>
        </div>
    );
}
