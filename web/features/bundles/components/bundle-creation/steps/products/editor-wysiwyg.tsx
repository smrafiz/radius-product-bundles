"use client";
import React from 'react';
import Editor from 'react-simple-wysiwyg';
import { useBundleProduct } from "@/features/bundles";

export function EditorWysiwyg ({ mode }: { mode: "create" | "edit" }) {

    const {
        handleDescriptionChange,
        productDescription,
    } = useBundleProduct(mode);

    // const [value, setValue] = React.useState('');
    // const onChangeHandler = (e) => {
    //     setValue(e.target.value);
    // }

    return (
        <>
            <Editor
                //value={value}
                name="productDescription"
                value={productDescription}
                placeholder="Describe this bundle product..."
                // onChange={(event: Event) => {
                //     const target = event.target as HTMLTextAreaElement;
                //     handleDescriptionChange(target.value);
                // }}
                //onChange={onChangeHandler}
            />
        </>
    );
}
